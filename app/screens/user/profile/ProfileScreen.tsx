import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
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
import barService from '../../../services/BarService';

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
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    console.log('[ProfileScreen] useEffect - user:', user);
    if (user) {
      console.log('[ProfileScreen] Loading user data');
      fetchUserReviewCount();
    }
  }, []);

  useEffect(() => {
    console.log('[ProfileScreen] user changed:', user);
  }, [user]);

  const fetchUserReviewCount = async () => {
    try {
      const response = await barService.getUserReviewCount();
      setReviewCount(response.data.count);
    } catch (error) {
      console.error('Error fetching review count:', error);
      setReviewCount(0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserReviewCount();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Función de confirmación de logout mejorada para desktop
  const confirmLogout = () => {
    if (Platform.OS === 'web' || isDesktop) {
      // Para web/desktop, usar confirm nativo del navegador si está disponible
      if (typeof window !== 'undefined' && window.confirm) {
        const confirmed = window.confirm('Are you sure you want to sign out?');
        if (confirmed) {
          performLogout();
        }
      } else {
        // Fallback para web sin confirm
        performLogout();
      }
    } else {
      // Para móvil, usar Alert de React Native
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  // Función que ejecuta el logout
  const performLogout = async () => {
    try {
      console.log('[ProfileScreen] Starting logout process...');
      setIsLoading(true);
      
      await logout();
      
      console.log('[ProfileScreen] Logout completed successfully');
      
      // Para desktop/web, podemos mostrar un mensaje de confirmación
      if (Platform.OS === 'web' || isDesktop) {
        console.log('[ProfileScreen] Logout successful - redirecting...');
      }
      
    } catch (error) {
      console.error('[ProfileScreen] Error during logout:', error);
      
      // Manejo de errores específico para desktop
      if (Platform.OS === 'web' || isDesktop) {
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Failed to logout. Please try again.');
        } else {
          console.error('Logout failed:', error);
        }
      } else {
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        // Para web, usar Web Share API si está disponible
        if (navigator.share) {
          await navigator.share({
            title: 'Share Profile',
            text: `Check out ${user?.name}'s profile on Beer Route!`,
            url: window.location.href,
          });
        } else {
          // Fallback para web sin Web Share API
          const text = `Check out ${user?.name}'s profile on Beer Route!`;
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            console.log('Profile link copied to clipboard');
          }
        }
      } else {
        await Share.share({
          message: `Check out ${user?.name}'s profile on Beer Route!`,
          title: 'Share Profile',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAccountTypeLabel = (accountType: string): string => {
    return accountType === 'business' ? 'Business' : 'User';
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
        <Text style={styles.loadingText}>Loading profile...</Text>
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
            <Text style={styles.statLabel}>Days as member</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="cake" size={24} color={colors.accent} />
            <Text style={styles.statValue}>{calculateAge(user.birthDate)}</Text>
            <Text style={styles.statLabel}>Years old</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="rate_review" size={24} color={colors.warning} />
            <Text style={styles.statValue}>{reviewCount}</Text>
            <Text style={styles.statLabel}>Reviews written</Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Icon name="person" size={20} color={colors.primary} />
                <Text style={styles.infoLabel}>Full name</Text>
              </View>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Icon name="email" size={20} color={colors.secondary} />
                <Text style={styles.infoLabel}>Email address</Text>
              </View>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Icon name="phone" size={20} color={colors.success} />
                <Text style={styles.infoLabel}>Phone</Text>
              </View>
              <Text style={styles.infoValue}>{user.phone || 'Not specified'}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Icon name="cake" size={20} color={colors.accent} />
                <Text style={styles.infoLabel}>Date of birth</Text>
              </View>
              <Text style={styles.infoValue}>{formatDate(user.birthDate)}</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Icon name="schedule" size={20} color={colors.textMuted} />
                <Text style={styles.infoLabel}>Member since</Text>
              </View>
              <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.editProfileButton]}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.quickActionContent}>
                <View style={styles.quickActionIconContainer}>
                  <Icon name="edit" size={28} color={colors.primary} />
                </View>
                <View style={styles.quickActionTextContainer}>
                  <Text style={styles.quickActionTitle}>Edit Profile</Text>
                  <Text style={styles.quickActionSubtitle}>Update your information</Text>
                </View>
                <Icon name="chevron_right" size={24} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.favoritesButton]}
              onPress={() => navigation.navigate('Favorites')}
            >
              <View style={styles.quickActionContent}>
                <View style={styles.quickActionIconContainer}>
                  <Icon name="favorite" size={28} color={colors.error} />
                </View>
                <View style={styles.quickActionTextContainer}>
                  <Text style={styles.quickActionTitle}>Favorites</Text>
                  <Text style={styles.quickActionSubtitle}>View saved bars</Text>
                </View>
                <Icon name="chevron_right" size={24} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button - Mejorado para desktop */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[
              styles.logoutButton, 
              //isLoading && styles.buttonDisabled,
              isDesktop && styles.logoutButtonDesktop
            ]}
            onPress={confirmLogout}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <>
                <Icon name="logout" size={20} color={colors.text} />
                <Text style={[styles.logoutButtonText, isDesktop && styles.logoutButtonTextDesktop]}>
                  Sign Out
                </Text>
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
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
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
  quickActionsContainer: {
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  editProfileButton: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  favoritesButton: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionIconContainer: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  quickActionTextContainer: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
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
    minHeight: 56,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  logoutButtonDesktop: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    minHeight: 60,
    ...(Platform.OS === 'web' && {
      ':hover': {
        backgroundColor: '#dc2626',
        transform: 'translateY(-1px)',
      },
    }),
  },
  logoutButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonTextDesktop: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: colors.textMuted,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
});

export default ProfileScreen;