import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
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
    View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { RegisterData } from '../../../services/AuthService';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    password: '',
    accountType: 'user',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterData & { confirmPassword: string }>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData & { confirmPassword: string }> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un correo válido';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    // Birth date validation
    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(formData.birthDate);
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 18);
      
      if (birthDate > cutoffDate) {
        newErrors.birthDate = 'Tienes que ser mayor de edad para registrarte';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await register(formData);

      if (response.success) {
        Alert.alert('Éxito', 'Registro exitoso', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Error al registrarse');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegisterData, value: string | Date) => {
    if (field === 'birthDate' && value instanceof Date) {
      setFormData({ ...formData, [field]: value.toISOString().split('T')[0] });
    } else {
      setFormData({ ...formData, [field]: value });
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleInputChange('birthDate', selectedDate);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Seleccionar fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Registro</Text>
          <Text style={styles.subtitle}>Crea tu cuenta</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Tu nombre completo"
              autoCapitalize="words"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Tu número de teléfono"
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Birth Date Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha de Nacimiento</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateInput, errors.birthDate && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, !formData.birthDate && styles.placeholderText]}>
                {formatDate(formData.birthDate)}
              </Text>
            </TouchableOpacity>
            {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.birthDate ? new Date(formData.birthDate) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Account Type Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tipo de Cuenta</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.accountType}
                onValueChange={(value) => handleInputChange('accountType', value)}
                style={styles.picker}
              >
                <Picker.Item label="Usuario" value="user" />
                <Picker.Item label="Negocio" value="business" />
              </Picker>
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: undefined });
                }
              }}
              placeholder="Confirma tu contraseña"
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Inicia sesión aquí</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#666',
  },
  link: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default RegisterScreen;