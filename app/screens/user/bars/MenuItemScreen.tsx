import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BarsStackParamList } from '../../../navigation/userNavigation';
import BarService from '../../../services/BarService';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isDesktop = width >= 1024;

// Dark theme colors - matching bar-details-screen
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
  star: '#fbbf24',
  starEmpty: '#52525b',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

type MenuItemScreenRouteProp = RouteProp<BarsStackParamList, 'MenuItem'>;
type MenuItemScreenNavigationProp = StackNavigationProp<BarsStackParamList, 'MenuItem'>;

interface MenuItemScreenProps {
  route: MenuItemScreenRouteProp;
  navigation: MenuItemScreenNavigationProp;
}

interface MenuItem {
  _id: string;
  bar: {
    _id: string;
    name: string;
  };
  name: string;
  description: string;
  price: number;
  photo: string;
  type: 'alcohol' | 'comida' | 'bebida';
  alcoholPercentage?: number;
  volume?: number;
  createdAt: string;
  updatedAt: string;
}

interface Bar {
  _id: string;
  name: string;
  photo?: string;
}

type MenuItemType = 'alcohol' | 'comida' | 'bebida';

const MenuItemScreen: React.FC<MenuItemScreenProps> = ({ route, navigation }) => {
  const { itemId, barId } = route.params;
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [bar, setBar] = useState<Bar | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [barImageError, setBarImageError] = useState(false);

  const fetchMenuItemData = useCallback(async () => {
    try {
      setLoading(true);
      setImageError(false);
      setBarImageError(false);
      
      // Corrected parameter order
      const menuItemResponse = await BarService.getMenuItemById(barId, itemId);
      setMenuItem(menuItemResponse);
  
      // Fetch bar details
      const barResponse = await BarService.getBarById(barId);
      setBar(barResponse.data);
  
    } catch (error) {
      console.error('Error fetching menu item data:', error);
      Alert.alert('Error', 'Failed to load menu item information');
      setMenuItem(null);
      setBar(null);
    } finally {
      setLoading(false);
    }
  }, [barId, itemId]);

  useEffect(() => {
    fetchMenuItemData();
  }, [fetchMenuItemData]);

  const getTypeLabel = (type: MenuItemType) => {
    const typeLabels = {
      alcohol: 'Bebida Alcohólica',
      comida: 'Comida',
      bebida: 'Bebida'
    };
    return typeLabels[type] || type;
  };

  const getTypeColor = (type: MenuItemType) => {
    switch (type) {
      case 'alcohol': return colors.accent;
      case 'comida': return colors.success;
      case 'bebida': return colors.primary;
      default: return colors.textMuted;
    }
  };

  const getTypeIcon = (type: MenuItemType) => {
    switch (type) {
      case 'alcohol': return 'wine-bar';
      case 'comida': return 'restaurant';
      case 'bebida': return 'local-cafe';
      default: return 'restaurant-menu';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading menu item...</Text>
      </SafeAreaView>
    );
  }

  if (!menuItem) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <Icon name="error-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>Menu item not found</Text>
        <Text style={styles.errorSubtext}>The item you're looking for doesn't exist</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <ScrollView style={styles.scrollView}>
        {/* Header Image with Overlay */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: imageError ? 'https://via.placeholder.com/400x200?text=No+Image' : menuItem.photo }}
            style={styles.headerImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
          <View style={styles.headerOverlay}>
            <TouchableOpacity 
              style={styles.backIconButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.typeBadgeContainer}>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(menuItem.type) }]}>
              <Icon name={getTypeIcon(menuItem.type)} size={16} color={colors.text} />
              <Text style={styles.typeBadgeText}>{getTypeLabel(menuItem.type)}</Text>
            </View>
          </View>
        </View>

        {/* Menu Item Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.itemName}>{menuItem.name}</Text>
          
          {/* Price Badge */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>${menuItem.price.toFixed(2)}</Text>
          </View>
          
          {/* Bar Info */}
          {bar && (
            <TouchableOpacity 
              style={styles.barCard}
              onPress={() => navigation.navigate('BarDetails', { barId: bar._id })}
            >
              <View style={styles.barHeader}>
                <Icon name="store" size={24} color={colors.primary} />
                <Text style={styles.barSectionTitle}>From</Text>
              </View>
              <View style={styles.barInfo}>
                {bar.photo && !barImageError ? (
                  <Image
                    source={{ uri: bar.photo }}
                    style={styles.barThumbnail}
                    resizeMode="cover"
                    onError={() => setBarImageError(true)}
                  />
                ) : (
                  <View style={[styles.barThumbnail, styles.barThumbnailPlaceholder]}>
                    <Icon name="store" size={20} color={colors.textMuted} />
                  </View>
                )}
                <Text style={styles.barName}>{bar.name}</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Details Section */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Details</Text>
            
            {/* Type */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Icon name={getTypeIcon(menuItem.type)} size={20} color={getTypeColor(menuItem.type)} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailText}>{getTypeLabel(menuItem.type)}</Text>
              </View>
            </View>

            {/* Alcohol Percentage (if applicable) */}
            {menuItem.type === 'alcohol' && menuItem.alcoholPercentage && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="percent" size={20} color={colors.warning} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Alcohol Content</Text>
                  <Text style={styles.detailText}>{menuItem.alcoholPercentage}%</Text>
                </View>
              </View>
            )}

            {/* Volume (if applicable) */}
            {menuItem.volume && menuItem.volume > 0 && (
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Icon name="local-drink" size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Volume</Text>
                  <Text style={styles.detailText}>{menuItem.volume}ml</Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          {menuItem.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{menuItem.description}</Text>
            </View>
          )}
          
          {/* Date Info */}
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>
              Added on {new Date(menuItem.createdAt).toLocaleDateString()}
            </Text>
          </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 32,
  },
  errorText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
    height: isTablet ? 300 : 250,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: colors.overlay,
  },
  backIconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  typeBadgeContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeBadgeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  infoContainer: {
    padding: 20,
  },
  itemName: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  priceContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  barCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  barHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  barInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  barThumbnailPlaceholder: {
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barName: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  descriptionCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  dateInfo: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  dateText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});

export default MenuItemScreen;