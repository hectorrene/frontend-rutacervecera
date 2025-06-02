import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
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
import { useAuth } from '../../../context/AuthContext';
import { LoginData } from '../../../services/AuthService';

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
  overlay: 'rgba(0, 0, 0, 0.7)',
  gradientStart: 'rgba(59, 130, 246, 0.8)',
  gradientEnd: 'rgba(139, 92, 246, 0.8)',
};

interface LoginScreenProps {
  navigation: any; 
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    // Valida el correo
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un correo válido';
    }

    // Valida la contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await login(formData);

      if (response.success) {
        Alert.alert('Éxito', 'Inicio de sesión exitoso');
      } else {
        Alert.alert('Error', response.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Quita el error cuando escribe el usuario
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Próximamente', `Login con ${provider} estará disponible pronto`);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Contraseña',
      'Se enviará un enlace de recuperación a tu correo electrónico',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => console.log('Send recovery email') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd, colors.overlay]}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoid}
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
            </View>

            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View 
                style={[
                  styles.contentContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim }
                    ]
                  }
                ]}
              >
                {/* Logo Section */}
                <View style={styles.logoSection}>
                  <View style={styles.logoContainer}>
                    <Icon name="local-bar" size={isTablet ? 60 : 48} color={colors.text} />
                  </View>
                  <Text style={styles.logoText}>Ruta Cervecera</Text>
                </View>

                {/* Form Container */}
                <View style={styles.formContainer}>
                  <View style={styles.titleSection}>
                    <Text style={styles.title}>Iniciar Sesión</Text>
                    <Text style={styles.subtitle}>Bienvenido de vuelta</Text>
                  </View>

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Correo Electrónico</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'email' && styles.inputWrapperFocused,
                      errors.email && styles.inputWrapperError
                    ]}>
                      <Icon name="email" size={20} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        placeholder="correo@ejemplo.com"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Contraseña</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'password' && styles.inputWrapperFocused,
                      errors.password && styles.inputWrapperError
                    ]}>
                      <Icon name="lock" size={20} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={formData.password}
                        onChangeText={(value) => handleInputChange('password', value)}
                        placeholder="Tu contraseña"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                      >
                        <Icon 
                          name={showPassword ? "visibility-off" : "visibility"} 
                          size={20} 
                          color={colors.textMuted} 
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                  </View>

                  {/* Forgot Password */}
                  <TouchableOpacity 
                    style={styles.forgotPassword}
                    onPress={handleForgotPassword}
                  >
                    <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity
                    style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[colors.primary, colors.primaryVariant]}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isLoading ? (
                        <ActivityIndicator color={colors.text} size="small" />
                      ) : (
                        <>
                          <Icon name="login" size={20} color={colors.text} />
                          <Text style={styles.buttonText}>Iniciar Sesión</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>o continúa con</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Social Login */}
                  <View style={styles.socialContainer}>
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => handleSocialLogin('Google')}
                    >
                      <Icon name="g-translate" size={24} color={colors.text} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => handleSocialLogin('Facebook')}
                    >
                      <Icon name="facebook" size={24} color={colors.text} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => handleSocialLogin('Apple')}
                    >
                      <Icon name="phone-iphone" size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  {/* Register Link */}
                  <View style={styles.linkContainer}>
                    <Text style={styles.linkText}>¿No tienes cuenta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                      <Text style={styles.link}>Regístrate aquí</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 8,
    alignSelf: 'flex-start',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  contentContainer: {
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 50 : 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoText: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: colors.text,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapperFocused: {
    borderColor: colors.inputFocused,
    backgroundColor: colors.surfaceVariant,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 14,
    marginHorizontal: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  link: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;