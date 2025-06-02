import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BusinessStackParamList } from '../../../navigation/userNavigation';
import BusinessService from '../../../services/BusinessService';

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
};

type EditBarScreenRouteProp = RouteProp<BusinessStackParamList, 'EditBarScreen'>;
type EditBarScreenNavigationProp = StackNavigationProp<BusinessStackParamList, 'EditBarScreen'>;

interface Props {
  route: EditBarScreenRouteProp;
  navigation: EditBarScreenNavigationProp;
}

interface BarData {
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

const availableTags = [
  "Beer Garden",
  "Air Conditioned", 
  "Local Talent",
  "Local Beers",
  "Imported Beers",
  "Food",
  "Live Music",
  "Family Friendly",
  "Terrace",
  "Adults Only",
  "Open Bar",
  "Sports Bar"
];

const EditBarScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barId, barName } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalBarData, setOriginalBarData] = useState<BarData | null>(null);
  const [barData, setBarData] = useState<BarData>({
    name: '',
    description: '',
    photo: '',
    address: {
      street: '',
      city: 'Mexicali',
      state: 'Baja California',
      zipCode: '',
    },
    mapsUrl: '',
    phone: '',
    tags: [],
  });

  useEffect(() => {
    loadBarData();
  }, []);

  const loadBarData = async () => {
    try {
      setLoading(true);
      console.log('Loading bar data for barId:', barId);
      
      const response = await BusinessService.getBar(barId);
      console.log('Bar data response:', response.data);
      
      if (response && response.data) {
        let bar;
        
        // Handle different response structures
        if (response.data.success && response.data.data) {
          bar = response.data.data;
        } else if (response.data.success === false) {
          console.error('API returned success: false', response.data);
          Alert.alert('Error', response.data.message || 'Failed to load bar information');
          return;
        } else {
          // Direct bar data without success wrapper
          bar = response.data;
        }
        
        if (bar) {
          const barInfo = {
            name: bar.name || '',
            description: bar.description || '',
            photo: bar.photo || '',
            address: {
              street: bar.address?.street || '',
              city: bar.address?.city || 'Mexicali',
              state: bar.address?.state || 'Baja California',
              zipCode: bar.address?.zipCode || '',
            },
            mapsUrl: bar.mapsUrl || '',
            phone: bar.phone || '',
            tags: Array.isArray(bar.tags) ? bar.tags : [],
          };
          
          console.log('Processed bar info:', barInfo);
          
          // Save original data and current data
          setOriginalBarData(barInfo);
          setBarData(barInfo);
        } else {
          console.error('No bar data found in response');
          Alert.alert('Error', 'No bar data found');
        }
      } else {
        console.error('Invalid response structure:', response);
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (error) {
      console.error('Error loading bar data:', error);
      if (typeof error === 'object' && error !== null && 'response' in error) {
        // @ts-expect-error: dynamic error shape from axios or fetch
        console.error('Error details:', error.response?.data);
      }
      Alert.alert('Error', 'Could not load bar information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Basic validations
    if (!barData.name.trim()) {
      Alert.alert('Error', 'Bar name is required');
      return;
    }

    if (!barData.description.trim()) {
      Alert.alert('Error', 'Bar description is required');
      return;
    }

    try {
      setSaving(true);
      const response = await BusinessService.updateBar(barId, barData);
      
      if (response.data && response.data.success) {
        Alert.alert(
          'Success',
          'Bar updated successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('BusinessDetails', { 
                  barId, 
                  barName: barData.name 
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to update bar');
      }
    } catch (error) {
      console.error('Error updating bar:', error);
      Alert.alert('Error', 'Could not update bar');
    } finally {
      setSaving(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setBarData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const updateAddress = (field: keyof BarData['address'], value: string) => {
    setBarData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading bar information...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Bar</Text>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bar Name *</Text>
            <TextInput
              style={styles.input}
              value={barData.name}
              onChangeText={(text) => setBarData(prev => ({ ...prev, name: text }))}
              placeholder="Enter bar name"
              placeholderTextColor={colors.textMuted}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={barData.description}
              onChangeText={(text) => setBarData(prev => ({ ...prev, description: text }))}
              placeholder="Describe your bar..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
            <Text style={styles.charCount}>
              {barData.description.length}/1000
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Photo URL</Text>
            <TextInput
              style={styles.input}
              value={barData.photo}
              onChangeText={(text) => setBarData(prev => ({ ...prev, photo: text }))}
              placeholder="https://example.com/photo.jpg"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={barData.phone}
              onChangeText={(text) => setBarData(prev => ({ ...prev, phone: text }))}
              placeholder="Enter phone number"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Street</Text>
            <TextInput
              style={styles.input}
              value={barData.address.street}
              onChangeText={(text) => updateAddress('street', text)}
              placeholder="Street and number"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={barData.address.city}
                onChangeText={(text) => updateAddress('city', text)}
                placeholder="City"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>Zip Code</Text>
              <TextInput
                style={styles.input}
                value={barData.address.zipCode}
                onChangeText={(text) => updateAddress('zipCode', text)}
                placeholder="ZIP"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={barData.address.state}
              onChangeText={(text) => updateAddress('state', text)}
              placeholder="State"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Google Maps URL</Text>
            <TextInput
              style={styles.input}
              value={barData.mapsUrl}
              onChangeText={(text) => setBarData(prev => ({ ...prev, mapsUrl: text }))}
              placeholder="https://maps.google.com/..."
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <Text style={styles.sectionSubtitle}>
            Select the features that best describe your bar
          </Text>
          
          <View style={styles.tagsContainer}>
            {availableTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  barData.tags.includes(tag) && styles.tagSelected
                ]}
                onPress={() => handleTagToggle(tag)}
              >
                <Text style={[
                  styles.tagText,
                  barData.tags.includes(tag) && styles.tagTextSelected
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
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
  charCount: {
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
  tag: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  tagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 50,
  },
});

export default EditBarScreen;