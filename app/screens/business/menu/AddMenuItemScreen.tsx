import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BusinessStackParamList } from '../../../navigation/userNavigation';
import BusinessService from '../../../services/BusinessService';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Dark theme colors
const colors = {
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceVariant: '#2a2a2a',
  surfaceElevated: '#1f1f1f',
  primary: '#3b82f6',
  primaryVariant: '#2563eb',
  secondary: '#6366f1',
  accent: '#8b5cf6',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  border: '#27272a',
  borderLight: '#3f3f46',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  inputBackground: '#27272a',
};

type AddMenuItemScreenRouteProp = RouteProp<BusinessStackParamList, 'AddMenuItemScreen'>;
type AddMenuItemScreenNavigationProp = StackNavigationProp<BusinessStackParamList>;

type AddMenuItemScreenProps = {
  route: AddMenuItemScreenRouteProp;
  navigation: AddMenuItemScreenNavigationProp;
};

interface MenuItemForm {
  name: string;
  description: string;
  price: string;
  photo: string;
  type: 'alcohol' | 'comida' | 'bebida';
  alcoholPercentage: string;
  volume: string;
}

const AddMenuItemScreen: React.FC<AddMenuItemScreenProps> = ({ route, navigation }) => {
  const { barId, barName } = route.params;

  const [form, setForm] = useState<MenuItemForm>({
    name: '',
    description: '',
    price: '',
    photo: '',
    type: 'comida', // Default to food
    alcoholPercentage: '',
    volume: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MenuItemForm, string>>>({});
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MenuItemForm, string>> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!form.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (form.type === 'alcohol') {
      if (!form.alcoholPercentage.trim()) {
        newErrors.alcoholPercentage = 'Alcohol percentage is required for alcoholic items';
      } else {
        const alcoholPercent = parseFloat(form.alcoholPercentage);
        if (isNaN(alcoholPercent) || alcoholPercent <= 0 || alcoholPercent > 100) {
          newErrors.alcoholPercentage = 'Alcohol percentage must be between 0 and 100';
        }
      }
    }

    if (form.volume.trim() && (isNaN(parseFloat(form.volume)) || parseFloat(form.volume) < 0)) {
      newErrors.volume = 'Volume must be a positive number';
    }

    // Validate URL if provided
    if (form.photo && !isValidUrl(form.photo)) {
      newErrors.photo = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const menuItemData = {
        bar: barId,
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        photo: form.photo.trim() || undefined,
        type: form.type,
        alcoholPercentage: form.type === 'alcohol' ? parseFloat(form.alcoholPercentage) : 0,
        volume: form.volume ? parseFloat(form.volume) : 0,
      };

      await BusinessService.addMenuItem(barId, menuItemData);
      
      Alert.alert(
        'Success',
        'Menu item created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating menu item:', error);
      Alert.alert('Error', 'Failed to create menu item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTypeOption = (type: 'alcohol' | 'comida' | 'bebida', label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.typeOption,
        form.type === type && styles.typeOptionSelected,
      ]}
      onPress={() => setForm({ ...form, type })}
    >
      <Icon name={icon} size={24} color={form.type === type ? colors.text : colors.textMuted} />
      <Text style={[
        styles.typeOptionText,
        form.type === type && styles.typeOptionTextSelected,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Menu Item</Text>
            <View style={styles.headerRight} />
          </View>

          <View style={styles.barInfoContainer}>
            <Text style={styles.barInfoLabel}>Adding to:</Text>
            <Text style={styles.barName}>{barName}</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Photo URL Input */}
            <View style={styles.photoSection}>
              <Text style={styles.sectionTitle}>Item Photo URL</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter image URL (optional)"
                  placeholderTextColor={colors.textMuted}
                  value={form.photo}
                  onChangeText={(text) => setForm({ ...form, photo: text })}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.photo && <Text style={styles.errorText}>{errors.photo}</Text>}
              </View>
              {form.photo ? (
                <View style={styles.photoPreviewContainer}>
                  <Image 
                    source={{ uri: form.photo }} 
                    style={styles.photoPreview} 
                    onError={() => setErrors({...errors, photo: 'Failed to load image from URL'})}
                  />
                </View>
              ) : null}
            </View>

            {/* Item Type */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Item Type</Text>
              <View style={styles.typeOptionsContainer}>
                {renderTypeOption('comida', 'Food', 'restaurant')}
                {renderTypeOption('bebida', 'Drink', 'local-cafe')}
                {renderTypeOption('alcohol', 'Alcohol', 'wine-bar')}
              </View>
            </View>

            {/* Basic Info */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter item name"
                  placeholderTextColor={colors.textMuted}
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter item description"
                  placeholderTextColor={colors.textMuted}
                  value={form.description}
                  onChangeText={(text) => setForm({ ...form, description: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  value={form.price}
                  onChangeText={(text) => setForm({ ...form, price: text })}
                  keyboardType="decimal-pad"
                />
                {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
              </View>
            </View>

            {/* Alcohol-specific fields */}
            {form.type === 'alcohol' && (
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Alcohol Details</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Alcohol Percentage *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0-100"
                    placeholderTextColor={colors.textMuted}
                    value={form.alcoholPercentage}
                    onChangeText={(text) => setForm({ ...form, alcoholPercentage: text })}
                    keyboardType="decimal-pad"
                  />
                  {errors.alcoholPercentage && <Text style={styles.errorText}>{errors.alcoholPercentage}</Text>}
                </View>
              </View>
            )}

            {/* Volume (optional for all types) */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Additional Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Volume (ml/g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Optional"
                  placeholderTextColor={colors.textMuted}
                  value={form.volume}
                  onChangeText={(text) => setForm({ ...form, volume: text })}
                  keyboardType="decimal-pad"
                />
                {errors.volume && <Text style={styles.errorText}>{errors.volume}</Text>}
              </View>
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Text style={styles.submitButtonText}>Create Item</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerRight: {
    width: 40, // For balance with back button
  },
  barInfoContainer: {
    padding: 16,
    backgroundColor: colors.surfaceVariant,
    marginBottom: 16,
  },
  barInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  barName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  formContainer: {
    padding: 16,
  },
  photoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  photoPreviewContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  photoPreview: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
  },
  formSection: {
    marginBottom: 24,
  },
  typeOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  typeOptionSelected: {
    backgroundColor: colors.primary,
  },
  typeOptionText: {
    color: colors.textMuted,
    marginTop: 8,
    fontWeight: '500',
  },
  typeOptionTextSelected: {
    color: colors.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export { AddMenuItemScreen };
export default AddMenuItemScreen;