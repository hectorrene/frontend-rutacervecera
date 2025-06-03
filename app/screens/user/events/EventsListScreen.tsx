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
import BarService from '../../../services/BarService';
import { EventsStackParamList } from '../../../types/navigation';

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
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'next_week' | 'next_month'>('all');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await BarService.getAllEvents();
      // Filter out past events - only show future events
      const now = new Date();
      const futureEvents = response.data.filter((event: Event) => new Date(event.start) > now);
      setEvents(futureEvents);
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
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFilteredEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    switch (activeFilter) {
      case 'today':
        return events.filter(event => {
          const eventDate = new Date(event.start);
          const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
          return eventDay.getTime() === today.getTime();
        });
      case 'next_week':
        return events.filter(event => {
          const eventDate = new Date(event.start);
          return eventDate >= now && eventDate <= nextWeek;
        });
      case 'next_month':
        return events.filter(event => {
          const eventDate = new Date(event.start);
          return eventDate >= now && eventDate <= nextMonth;
        });
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  const getCardWidth = () => {
    if (isDesktop) {
      return (width - 80) / 3 - 16; // 3 columns on desktop with better spacing
    } else if (isTablet) {
      return (width - 60) / 2 - 16; // 2 columns on tablet with better spacing
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
          source={{ uri: item.image || 'https://via.placeholder.com/400x240?text=No+Image' }}
          style={styles.eventImage}
          resizeMode="cover"
        />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>
            {item.price > 0 ? `$${item.price.toFixed(2)}` : 'Gratis'}
          </Text>
        </View>
        <View style={styles.dateOverlay}>
          <Text style={styles.dateText}>{formatDate(item.start)}</Text>
        </View>
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventName} numberOfLines={2}>
          {item.name || "Evento sin nombre"}
        </Text>
        
        <View style={styles.barContainer}>
          <Icon name="store" size={16} color={colors.primary} />
          <Text style={styles.barName} numberOfLines={1}>
            {item.bar?.name || "Bar no disponible"}
          </Text>
        </View>
        
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color={colors.accent} style={styles.detailIcon} />
            <Text style={styles.detailText}>
              {formatTime(item.start)}
            </Text>
          </View>
          
          {item.location && (
            <View style={styles.detailRow}>
              <Icon name="location-on" size={16} color={colors.secondary} style={styles.detailIcon} />
              <Text style={styles.detailText} numberOfLines={1}>{item.location}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Eventos</Text>
      <Text style={styles.headerSubtitle}>
        {filteredEvents.length} {filteredEvents.length === 1 ? 'evento próximo' : 'eventos próximos'}
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
          <Icon name="event" size={16} color={activeFilter === 'all' ? colors.text : colors.textSecondary} style={styles.filterIcon} />
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
            Todos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'today' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('today')}
        >
          <Icon name="today" size={16} color={activeFilter === 'today' ? colors.text : colors.textSecondary} style={styles.filterIcon} />
          <Text style={[styles.filterText, activeFilter === 'today' && styles.activeFilterText]}>
            Hoy
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'next_week' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('next_week')}
        >
          <Icon name="date-range" size={16} color={activeFilter === 'next_week' ? colors.text : colors.textSecondary} style={styles.filterIcon} />
          <Text style={[styles.filterText, activeFilter === 'next_week' && styles.activeFilterText]}>
            Esta semana
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'next_month' && styles.activeFilterButton]}
          onPress={() => setActiveFilter('next_month')}
        >
          <Icon name="calendar-month" size={16} color={activeFilter === 'next_month' ? colors.text : colors.textSecondary} style={styles.filterIcon} />
          <Text style={[styles.filterText, activeFilter === 'next_month' && styles.activeFilterText]}>
            Este mes
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="event-busy" size={80} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>No hay eventos disponibles</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter !== 'all' 
          ? 'Prueba con otro filtro para ver más eventos' 
          : 'No hay eventos programados por el momento.\nVuelve a revisar más tarde.'}
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
          key={isDesktop ? 'desktop-3' : isTablet ? 'tablet-2' : 'mobile-1'}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filtersScrollContent: {
    paddingRight: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: colors.surface,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 40,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterIcon: {
    marginRight: 6,
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
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  resetButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
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
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
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
    height: 180,
  },
  priceTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dateText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventContent: {
    padding: 20,
  },
  eventName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    lineHeight: 28,
    textAlign: 'left',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  barName: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  eventDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
});

export default EventsScreen;