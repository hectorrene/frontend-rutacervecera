import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../context/AuthContext';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

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
  business: '#f97316',
  user: '#3b82f6',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
    //const { user, logout, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('[ProfileScreen] useEffect - user:', user);
    if (user) {
      console.log('[ProfileScreen] Calling refreshProfile');
      //refreshProfile();
    }
  }, []);

  useEffect(() => {
    console.log('[ProfileScreen] user changed:', user);
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      //await //refreshProfile();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await logout();
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mire profe ${user?.name} me mandó mensaje en whatsapp`,
        title: 'Compartir perfil',
      });
    } catch (error) {
      console.error('Error sharing:', error);
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

  const getAccountTypeLabel = (accountType: string): string => {
    return accountType === 'business' ? 'Negocio' : 'Usuario';
  };

  const getAccountTypeColor = (accountType: string): string => {
    return accountType === 'business' ? colors.business : colors.user;
  };

  const getAccountTypeIcon = (accountType: string): string => {
    return accountType === 'business' ? 'business' : 'person';
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateMembershipDays = (createdAt: string): number => {
    return Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  };

  if (!user) {
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
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleShare}
            >
              <Icon name="share" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user.photo || 'https://www.gravatar.com/avatar/?d=mp&s=150',
                }}
                style={styles.avatar}
              />
              <View style={[styles.accountTypeBadge, { backgroundColor: getAccountTypeColor(user.accountType) }]}>
                <Icon 
                  name={getAccountTypeIcon(user.accountType)} 
                  size={16} 
                  color={colors.text} 
                />
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Icon name="camera-alt" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            
            <View style={styles.accountTypeContainer}>
              <Icon 
                name={getAccountTypeIcon(user.accountType)} 
                size={16} 
                color={getAccountTypeColor(user.accountType)} 
              />
              <Text style={[styles.accountTypeText, { color: getAccountTypeColor(user.accountType) }]}>
                {getAccountTypeLabel(user.accountType)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="event" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{calculateMembershipDays(user.createdAt)}</Text>
            <Text style={styles.statLabel}>Días como miembro</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="cake" size={24} color={colors.accent} />
            <Text style={styles.statValue}>{calculateAge(user.birthDate)}</Text>
            <Text style={styles.statLabel}>Años de edad</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="star" size={24} color={colors.warning} />
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Calificación</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Icon name="person" size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>Nombre completo</Text>
              </View>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Icon name="email" size={20} color={colors.secondary} />
                <Text style={styles.infoLabel}>Correo electrónico</Text>
              </View>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Icon name="phone" size={20} color={colors.success} />
                <Text style={styles.infoLabel}>Teléfono</Text>
              </View>
              <Text style={styles.infoValue}>{user.phone || 'No especificado'}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Icon name="cake" size={20} color={colors.accent} />
                <Text style={styles.infoLabel}>Fecha de nacimiento</Text>
              </View>
              <Text style={styles.infoValue}>{formatDate(user.birthDate)}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Icon name="schedule" size={20} color={colors.textMuted} />
                <Text style={styles.infoLabel}>Miembro desde</Text>
              </View>
              <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Icon name="edit" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Editar Perfil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Favorites')}
            >
              <Icon name="favorite" size={24} color={colors.error} />
              <Text style={styles.quickActionText}>Favoritos</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('BusinessBars')}
            >
              <Icon name="business" size={24} color={colors.error} />
              <Text style={styles.quickActionText}> Gestionar negocios </Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <>
                <Icon name="logout" size={20} color={colors.text} />
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    gap: 12,
  },
  headerButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: isTablet ? 140 : 120,
    height: isTablet ? 140 : 120,
    borderRadius: isTablet ? 70 : 60,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 4,
    borderColor: colors.border,
  },
  accountTypeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  name: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  accountTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountTypeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    width: (width - 64) / 2,
  },
  quickActionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  preferencesCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 12,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: colors.textMuted,
  },
});

export default ProfileScreen;