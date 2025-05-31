import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BarService from '../../services/BarService';
import { EventsStackParamList } from '../../types/navigation';

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
  star: '#fbbf24',
  starEmpty: '#52525b',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

interface Event {
  _id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  price: number;
  start: string;
  end: string;
  bar: {
    _id: string;
    name: string;
  };
}

type EventsScreenNavigationProp = StackNavigationProp<EventsStackParamList, 'EventsList'>;

interface EventsScreenProps {
  navigation: EventsScreenNavigationProp;
}

const EventsScreen: React.FC<EventsScreenProps> = ({ navigation }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'today' | 'weekend'>('all');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await BarService.getAllEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFilteredEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekend = new Date(now);
    weekend.setDate(now.getDate() + (6 - now.getDay()));

    switch (activeFilter) {
      case 'upcoming':
        return events.filter(event => new Date(event.start) > now);
      case 'today':
        return events.filter(event => {
          const eventDate = new Date(event.start);
          return eventDate.getDate() === today.getDate() && 
                 eventDate.getMonth() === today.getMonth() && 
                 eventDate.getFullYear() === today.getFullYear();
        });
      case 'weekend':
        const weekendStart = new Date(now);
        weekendStart.setDate(now.getDate() + (5 - now.getDay()));
        const weekendEnd = new Date(now);
        weekendEnd.setDate(now.getDate() + (7 - now.getDay()));
        
        return events.filter(event => {
          const eventDate = new Date(event.start);
          return eventDate >= weekendStart && eventDate <= weekendEnd;
        });
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  const getCardWidth = () => {
    if (isDesktop) {
      return (width - 64) / 3 - 16; // 3 columns on desktop
    } else if (isTablet) {
      return (width - 48) / 2 - 12; // 2 columns on tablet
    }
    return width - 32; // Full width on mobile
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={[
        styles.eventCard,
        { width: getCardWidth() },
        isDesktop && styles.desktopCard,
        isTablet && !isDesktop && styles.tabletCard
      ]}
      onPress={() => navigation.navigate('EventDetails', { eventId: item._id })}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/400x200?text=No+Image' }}
          style={styles.eventImage}
          resizeMode="cover"
        />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>
            {item.price > 0 ? `$${item.price.toFixed(2)}` : 'Free'}
          </Text>
        </View>
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.barName} numberOfLines={1}>{item.bar?.name || "Bar name not available"}</Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Icon name="event" size={16} color={colors.primary} style={styles.detailIcon} />
            <Text style={styles.detailText}>
              {formatDate(item.start)} {formatTime(item.start)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="location-on" size={16} color={colors.accent} style={styles.detailIcon} />
            <Text style={styles.detailText} numberOfLines={1}>{item.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Eventos</Text>
      <Text style={styles.headerSubtitle}>
        {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'} encontrados
      </Text>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScrollContent}
      >
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'all' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
            Todos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'upcoming' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('upcoming')}
        >
          <Text style={[styles.filterText, activeFilter === 'upcoming' && styles.activeFilterText]}>
            Próximos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'today' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('today')}
        >
          <Text style={[styles.filterText, activeFilter === 'today' && styles.activeFilterText]}>
            Hoy
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'weekend' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('weekend')}
        >
          <Text style={[styles.filterText, activeFilter === 'weekend' && styles.activeFilterText]}>
            Fin de semana
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="event-busy" size={64} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No hay eventos disponibles</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter !== 'all' 
          ? 'Prueba con otro filtro o vuelve más tarde' 
          : 'Vuelve a revisar más tarde para ver nuevos eventos'}
      </Text>
      {activeFilter !== 'all' && (
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={styles.resetButtonText}>Ver todos los eventos</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {renderHeader()}
      {renderFilters()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item._id}
          renderItem={renderEvent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            isDesktop && styles.desktopGrid,
            isTablet && !isDesktop && styles.tabletGrid
          ]}
          numColumns={isDesktop ? 3 : isTablet ? 2 : 1}
          key={isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile'}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
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
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filtersScrollContent: {
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: colors.text,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tabletGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  desktopCard: {
    marginBottom: 24,
  },
  tabletCard: {
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  priceTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  eventContent: {
    padding: 16,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  barName: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 12,
    fontWeight: '500',
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
});

export default EventsScreen;