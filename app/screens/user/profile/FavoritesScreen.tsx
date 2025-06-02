import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AuthService from '../../../services/AuthService';
import BarService from '../../../services/BarService';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

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
  heart: '#ef4444', // Red color for heart icon
};

interface FavoriteItem {
  _id: string;
  user: string;
  bar: {
    _id: string;
    name: string;
    description: string;
    photo?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
}

const FavoritesScreen = ({ navigation }: { navigation: any }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    try {
      const userId = AuthService.getCurrentUser()?._id;
      if (!userId) {
        throw new Error('User ID is undefined');
      }
      const response = await BarService.getFavorites(userId);
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  // const handleRemoveFavorite = async (favoriteId: string) => {
  //   try {
  //     await BarService.removeFavorite(favoriteId);
  //     // Update the favorites list after removal
  //     setFavorites(favorites.filter(fav => fav._id !== favoriteId));
  //   } catch (error) {
  //     console.error('Error removing favorite:', error);
  //     Alert.alert('Error', 'Failed to remove from favorites');
  //   }
  // };

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity 
      style={styles.itemCard}
      onPress={() => navigation.navigate('BarDetails', { 
        barId: item.bar._id 
      })}
      activeOpacity={0.8}
    >
      <View style={styles.itemCardContent}>
        <Image
          source={{ uri: item.bar.photo || 'https://via.placeholder.com/100?text=No+Image' }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.bar.name}</Text>
          <View style={styles.locationRow}>
            <Icon name="location-on" size={16} color={colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.bar.address.city}, {item.bar.address.state}
            </Text>
          </View>
          {item.bar.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.bar.description}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity 
        style={styles.favoriteButton}
        // onPress={() => handleRemoveFavorite(item._id)}
      >
        <Icon name="favorite" size={24} color={colors.heart} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.header2}>
      <Text style={styles.headerTitle2}>Your Favorites</Text>
      <Text style={styles.headerSubtitle}>
        {favorites.length} {favorites.length === 1 ? 'bar' : 'bars'} saved
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </SafeAreaView>
    );
  }

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.emptyIconContainer}>
          <Icon name="favorite-border" size={64} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyText}>No favorites yet</Text>
        <Text style={styles.emptySubtext}>
          Tap the heart icon on bars to add them to your favorites
        </Text>
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => navigation.navigate('Bars')}
        >
          <Text style={styles.exploreButtonText}>Explore Bars</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}> Favorites </Text>
      </View>
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  header2: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle2: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  itemCardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  favoriteButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FavoritesScreen;