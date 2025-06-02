import { useNavigation } from '@react-navigation/native';
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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BusinessStackParamList } from '../../../navigation/userNavigation';
import BusinessService from '../../../services/BusinessService';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Dark theme colors (matching your existing UI)
const colors = {
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceVariant: '#2a2a2a',
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
};

type CreateBarNavigationProp = StackNavigationProp<BusinessStackParamList, 'CreateBarScreen'>;

// Available tags from your schema
const AVAILABLE_TAGS = [
  "Beer Garden", 
  "Refrigerado", 
  "Talento cachanilla", 
  "Cervezas locales", 
  "Cervezas exportadas", 
  "Comida",
  "Música en vivo", 
  "Ambiente familiar", 
  "Terraza", 
  "Solo adultos", 
  "Barra libre", 
  "Sports bar"
];

interface CreateBarForm {
  name: string;
  description: string;
  photo: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  mapsUrl: string;
  phone: string;
  tags: string[];
}

const CreateBarScreen: React.FC = () => {
  const navigation = useNavigation<CreateBarNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateBarForm>({
    name: '',
    description: '',
    photo: '',
    address: {
      street: '',
      city: 'Mexicali',
      state: 'Baja California',
      zipCode: ''
    },
    mapsUrl: '',
    phone: '',
    tags: []
  });

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev: CreateBarForm) => {
        if (parent === 'address') {
          return {
            ...prev,
            address: {
              ...prev.address,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData((prev: CreateBarForm) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre del bar es requerido');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return false;
    }
    if (formData.name.length > 100) {
      Alert.alert('Error', 'El nombre no puede exceder 100 caracteres');
      return false;
    }
    if (formData.description.length > 1000) {
      Alert.alert('Error', 'La descripción no puede exceder 1000 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Clean up form data - remove empty fields
      const cleanFormData = {
        ...formData,
        photo: formData.photo.trim() || undefined,
        address: {
          ...formData.address,
          street: formData.address.street.trim() || undefined,
          zipCode: formData.address.zipCode.trim() || undefined,
        },
        mapsUrl: formData.mapsUrl.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      };      const response = await BusinessService.createBar(cleanFormData);
      
      if (response.data) {
        if (Platform.OS === 'web') {
          window.alert('Bar creado exitosamente');
        } else {
          Alert.alert('Éxito', 'Bar creado exitosamente');
        }
        navigation.navigate({ name: 'BarListScreen', params: undefined });
      }
    } catch (error) {
      console.error('Error creating bar:', error);
      Alert.alert('Error', 'No se pudo crear el bar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderTagSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Etiquetas</Text>
      <Text style={styles.sectionSubtitle}>Selecciona las características de tu bar</Text>
      <View style={styles.tagsContainer}>
        {AVAILABLE_TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagButton,
              formData.tags.includes(tag) && styles.tagButtonSelected
            ]}
            onPress={() => toggleTag(tag)}
          >
            <Text style={[
              styles.tagButtonText,
              formData.tags.includes(tag) && styles.tagButtonTextSelected
            ]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Crear Nuevo Bar</Text>
              <Text style={styles.headerSubtitle}>Completa la información de tu establecimiento</Text>
            </View>
          </View>

          {formData.photo ? (
            <View style={styles.photoPreview}>
              <Image
                source={{ uri: formData.photo }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre del Bar *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Mi Bar Favorito"
                placeholderTextColor={colors.textMuted}
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                maxLength={100}
              />
              <Text style={styles.charCounter}>{formData.name.length}/100</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe tu bar, ambiente, especialidades..."
                placeholderTextColor={colors.textMuted}
                value={formData.description}
                onChangeText={(value) => updateFormData('description', value)}
                multiline
                numberOfLines={4}
                maxLength={1000}
              />
              <Text style={styles.charCounter}>{formData.description.length}/1000</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL de Foto</Text>
              <TextInput
                style={styles.input}
                placeholder="https://ejemplo.com/foto.jpg"
                placeholderTextColor={colors.textMuted}
                value={formData.photo}
                onChangeText={(value) => updateFormData('photo', value)}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="(686) 123-4567"
                placeholderTextColor={colors.textMuted}
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dirección</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Calle</Text>
              <TextInput
                style={styles.input}
                placeholder="Calle y número"
                placeholderTextColor={colors.textMuted}
                value={formData.address.street}
                onChangeText={(value) => updateFormData('address.street', value)}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput
                  style={styles.input}
                  value={formData.address.city}
                  onChangeText={(value) => updateFormData('address.city', value)}
                />
              </View>
              
              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.label}>Código Postal</Text>
                <TextInput
                  style={styles.input}
                  placeholder="21000"
                  placeholderTextColor={colors.textMuted}
                  value={formData.address.zipCode}
                  onChangeText={(value) => updateFormData('address.zipCode', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estado</Text>
              <TextInput
                style={styles.input}
                value={formData.address.state}
                onChangeText={(value) => updateFormData('address.state', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL de Google Maps</Text>
              <TextInput
                style={styles.input}
                placeholder="https://maps.google.com/..."
                placeholderTextColor={colors.textMuted}
                value={formData.mapsUrl}
                onChangeText={(value) => updateFormData('mapsUrl', value)}
              />
            </View>
          </View>

          {renderTagSelector()}

          {formData.tags.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Etiquetas Seleccionadas</Text>
              <View style={styles.selectedTagsContainer}>
                {formData.tags.map((tag) => (
                  <View key={tag} style={styles.selectedTag}>
                    <Text style={styles.selectedTagText}>{tag}</Text>
                    <TouchableOpacity onPress={() => toggleTag(tag)}>
                      <Icon name="close" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.createButton, loading && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <View style={styles.buttonContent}>
                <Icon name="add" size={20} color={colors.text} />
                <Text style={styles.createButtonText}>Crear Bar</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  photoPreview: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  tagButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tagButtonTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  selectedTagText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CreateBarScreen;