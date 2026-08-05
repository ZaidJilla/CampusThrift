from fastapi import APIRouter, HTTPException

from app.core.schools import school_from_email
from app.schemas.auth import SignUpRequest, SignUpResponse
from app.services.supabase_client import get_admin_client

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=SignUpResponse)
def signup(payload: SignUpRequest) -> SignUpResponse:
    school = school_from_email(payload.email)
    if school is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Campus Closet is only available to Tufts and Northeastern students. "
                "Please sign up with your .edu email."
            ),
        )

    admin = get_admin_client()

    try:
        created = admin.auth.admin.create_user(
            {
                "email": payload.email,
                "password": payload.password,
                # Requires the usual email confirmation before login is allowed.
                # Note: unlike the client's auth.signUp(), the admin API does not send
                # the confirmation email itself — that still needs to be wired up
                # (e.g. admin.generate_link + your own mailer) before this replaces
                # the client-side signup flow.
                "email_confirm": False,
            }
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    user = created.user
    if user is None:
        raise HTTPException(status_code=500, detail="Could not create user.")

    try:
        admin.table("profiles").insert(
            {
                "id": user.id,
                "school_id": school["id"],
                "full_name": payload.full_name.strip(),
            }
        ).execute()
    except Exception as exc:
        admin.auth.admin.delete_user(user.id)
        raise HTTPException(
            status_code=500, detail="Account rolled back: profile setup failed."
        ) from exc

    return SignUpResponse(
        user_id=user.id,
        school_id=school["id"],
        message=f"Account created for {payload.email}. Confirm your email, then log in.",
    )
