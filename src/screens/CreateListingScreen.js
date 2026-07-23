import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export default function CreateListingScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState('');
  const [listingType, setListingType] = useState('resale'); // 'resale' | 'handmade'
  const [photoUri, setPhotoUri] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'We need photo library access to add listing photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!title.trim() || !price) {
      Alert.alert('Missing info', 'Title and price are required.');
      return;
    }
    const priceCents = Math.round(parseFloat(price) * 100);
    if (isNaN(priceCents) || priceCents < 0) {
      Alert.alert('Invalid price', 'Enter a valid price like 25.00');
      return;
    }

    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', userData.user.id)
        .single();

      const { data: listing, error } = await supabase
        .from('listings')
        .insert({
          seller_id: userData.user.id,
          school_id: profile.school_id,
          title: title.trim(),
          description: description.trim(),
          price_cents: priceCents,
          category: category.trim() || null,
          size: size.trim() || null,
          condition: condition.trim() || null,
          listing_type: listingType,
        })
        .select('id')
        .single();

      if (error) throw error;

      if (photoUri) {
        const fileExt = photoUri.split('.').pop();
        const fileName = `${listing.id}-${Date.now()}.${fileExt}`;
        const response = await fetch(photoUri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('listing-photos')
          .upload(fileName, blob, { contentType: `image/${fileExt}` });

        if (!uploadError) {
          const { data: publicUrl } = supabase.storage
            .from('listing-photos')
            .getPublicUrl(fileName);

          await supabase.from('listing_photos').insert({
            listing_id: listing.id,
            photo_url: publicUrl.publicUrl,
          });
        }
      }

      Alert.alert('Listed!', 'Your item is now live for your campus to see.');
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
      setSize('');
      setCondition('');
      setPhotoUri(null);
      setListingType('resale');
      navigation.navigate('HomeTab');
    } catch (err) {
      Alert.alert('Error creating listing', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Sell an item</Text>

      <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoPickerText}>+ Add Photo</Text>
        )}
      </TouchableOpacity>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, listingType === 'resale' && styles.toggleButtonActive]}
          onPress={() => setListingType('resale')}
        >
          <Text style={listingType === 'resale' ? styles.toggleTextActive : styles.toggleText}>
            Resale
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, listingType === 'handmade' && styles.toggleButtonActive]}
          onPress={() => setListingType('handmade')}
        >
          <Text style={listingType === 'handmade' ? styles.toggleTextActive : styles.toggleText}>
            Handmade by me
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Price (e.g. 25.00)"
        keyboardType="decimal-pad"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        style={styles.input}
        placeholder="Category (e.g. Jackets, Tops)"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput style={styles.input} placeholder="Size" value={size} onChangeText={setSize} />
      <TextInput
        style={styles.input}
        placeholder="Condition (e.g. Like new, Good, Worn)"
        value={condition}
        onChangeText={setCondition}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Posting...' : 'Post Listing'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  photoPicker: {
    height: 180,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPickerText: { color: '#888', fontSize: 16 },
  toggleRow: { flexDirection: 'row', marginBottom: 16 },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  toggleButtonActive: { backgroundColor: '#111', borderColor: '#111' },
  toggleText: { color: '#111' },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  multiline: { height: 90, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
