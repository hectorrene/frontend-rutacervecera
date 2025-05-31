import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BarsStackParamList } from '../../navigation/userNavigation';
import BarService from '../../services/BarService';

const { width } = Dimensions.get('window');

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

const MenuItemScreen: React.FC<MenuItemScreenProps> = ({ route }) => {
  const { itemId, barId } = route.params;
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [bar, setBar] = useState<Bar | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMenuItemData = async () => {
    try {
      setLoading(true);
      
      // Fetch menu item details
      const menuItemResponse = await BarService.getMenuItemById(itemId, barId);
      setMenuItem(menuItemResponse.data);

      // Fetch bar details
      const barResponse = await BarService.getBarById(barId);
      setBar(barResponse.data);

    } catch (error) {
      console.error('Error fetching menu item data:', error);
      Alert.alert('Error', 'Failed to load menu item information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItemData();
  }, [itemId, barId]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'alcohol': return 'Bebida Alcohólica';
      case 'comida': return 'Comida';
      case 'bebida': return 'Bebida';
      default: return type;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading menu item...</Text>
      </SafeAreaView>
    );
  }

  if (!menuItem) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Menu item not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Image */}
        <Image
          source={{ uri: menuItem.photo || 'https://via.placeholder.com/400x200?text=No+Image' }}
          style={styles.headerImage}
          resizeMode="cover"
        />

        {/* Menu Item Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.itemName}>{menuItem.name}</Text>
          
          {/* Bar Info */}
          {bar && (
            <View style={styles.barContainer}>
              <Text style={styles.sectionTitle}>From</Text>
              <View style={styles.barInfo}>
                {bar.photo && (
                  <Image
                    source={{ uri: bar.photo }}
                    style={styles.barThumbnail}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.barName}>{bar.name}</Text>
              </View>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>${menuItem.price.toFixed(2)}</Text>
          </View>

          {/* Type */}
          <View style={styles.detailRow}>
            <Icon name="local-offer" size={20} color="#666" />
            <Text style={styles.detailText}>{getTypeLabel(menuItem.type)}</Text>
          </View>

          {/* Alcohol Percentage (if applicable) */}
          {menuItem.type === 'alcohol' && menuItem.alcoholPercentage && (
            <View style={styles.detailRow}>
              <Icon name="local-bar" size={20} color="#666" />
              <Text style={styles.detailText}>
                {menuItem.alcoholPercentage}% Alcohol
              </Text>
            </View>
          )}

          {/* Volume (if applicable) */}
          {menuItem.volume && menuItem.volume > 0 && (
            <View style={styles.detailRow}>
              <Icon name="straighten" size={20} color="#666" />
              <Text style={styles.detailText}>
                {menuItem.volume}ml
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{menuItem.description}</Text>
          </View>

          {/* Added Date */}
          <View style={styles.detailRow}>
            <Icon name="event" size={20} color="#666" />
            <Text style={styles.detailText}>
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
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
  },
  scrollView: {
    flex: 1,
  },
  headerImage: {
    width: width,
    height: 250,
  },
  infoContainer: {
    padding: 20,
  },
  itemName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  barContainer: {
    marginBottom: 20,
  },
  barInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  barThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  barName: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
  },
  priceContainer: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
});

export default MenuItemScreen;