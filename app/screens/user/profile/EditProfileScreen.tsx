import DateTimePicker from '@react-native-community/datetimepicker';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BarService from '../../../services/BarService';
import { ProfileStackParamList } from '../../../types/navigation';

const { width, height } = Dimensions.get('window');
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
  inputBackground: '#1f1f1f',
  inputBorder: '#3f3f46',
  inputFocused: '#3b82f6',
};

interface User {
  name: string;
  phone: string;
  birthDate: string;
  photo: string;
  email?: string;
}

type EditProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'EditProfile'>;

interface EditProfileScreenProps {
  navigation: EditProfileScreenNavigationProp;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User>({
    name: '',
    phone: '',
    birthDate: new Date().toISOString(),
    photo: '',
    email: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await BarService.getMyProfile();
        setUser(response.data);
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!user.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (user.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!user.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\+?[\d\s\-$$$$]+$/.test(user.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    const birthDate = new Date(user.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 13) {
      newErrors.birthDate = 'Debes tener al menos 13 años';
    } else if (age > 120) {
      newErrors.birthDate = 'Fecha de nacimiento inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setSaving(true);
      await BarService.updateProfile(user);
      Alert.alert(
        'Éxito', 
        'Perfil actualizado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setUser(prev => ({
        ...prev,
        birthDate: selectedDate.toISOString(),
      }));
      // Clear date error if exists
      if (errors.birthDate) {
        setErrors(prev => ({ ...prev, birthDate: '' }));
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoPress = () => {
    Alert.alert(
      'Cambiar foto',
      'Selecciona una opción',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cámara', onPress: () => console.log('Open camera') },
        { text: 'Galería', onPress: () => console.log('Open gallery') },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        
        <TouchableOpacity 
          style={[styles.headerButton, saving && styles.headerButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Icon name="check" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity 
              style={styles.photoContainer}
              onPress={handlePhotoPress}
            >
              <Image
                source={{
                  uri: user.photo || 'https://www.gravatar.com/avatar/?d=mp&s=150',
                }}
                style={styles.profilePhoto}
              />
              <View style={styles.photoOverlay}>
                <Icon name="camera-alt" size={24} color={colors.text} />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoHint}>Toca para cambiar foto</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'name' && styles.inputContainerFocused,
                errors.name && styles.inputContainerError
              ]}>
                <Icon name="person" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={user.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  placeholder="Ingresa tu nombre completo"
                  placeholderTextColor={colors.textMuted}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email Field (Read-only) */}
            {user.email && (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Correo electrónico</Text>
                <View style={[styles.inputContainer, styles.inputContainerDisabled]}>
                  <Icon name="email" size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, styles.textInputDisabled]}
                    value={user.email}
                    editable={false}
                    placeholder="Correo electrónico"
                    placeholderTextColor={colors.textMuted}
                  />
                  <Icon name="lock" size={16} color={colors.textMuted} />
                </View>
                <Text style={styles.fieldHint}>El correo electrónico no se puede modificar</Text>
              </View>
            )}

            {/* Phone Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Teléfono</Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'phone' && styles.inputContainerFocused,
                errors.phone && styles.inputContainerError
              ]}>
                <Icon name="phone" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={user.phone}
                  onChangeText={(text) => handleInputChange('phone', text)}
                  placeholder="Ingresa tu número de teléfono"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Birth Date Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Fecha de nacimiento</Text>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  errors.birthDate && styles.inputContainerError
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="cake" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <Text style={styles.dateText}>
                  {formatDate(user.birthDate)}
                </Text>
                <Icon name="keyboard-arrow-down" size={20} color={colors.textMuted} />
              </TouchableOpacity>
              {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <>
                  <Icon name="save" size={20} color={colors.text} />
                  <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(user.birthDate)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePhoto: {
    width: isTablet ? 140 : 120,
    height: isTablet ? 140 : 120,
    borderRadius: isTablet ? 70 : 60,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 4,
    borderColor: colors.border,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  photoHint: {
    fontSize: 14,
    color: colors.textMuted,
  },
  formContainer: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainerFocused: {
    borderColor: colors.inputFocused,
    backgroundColor: colors.surfaceVariant,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputContainerDisabled: {
    backgroundColor: colors.surfaceVariant,
    opacity: 0.6,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
  },
  textInputDisabled: {
    color: colors.textMuted,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
  fieldHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    marginLeft: 4,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditProfileScreen;