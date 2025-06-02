import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Linking,
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

type EventDetailsScreenRouteProp = RouteProp<EventsStackParamList, 'EventDetails'>;
type EventDetailsScreenNavigationProp = StackNavigationProp<EventsStackParamList, 'EventDetails'>;

interface EventDetailsScreenProps {
  route: EventDetailsScreenRouteProp;
  navigation: EventDetailsScreenNavigationProp;
}

const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await BarService.getEventById(eventId);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvent();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
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

  const getDaysDifference = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays > 0) return `En ${diffDays} días`;
    return 'Evento pasado';
  };

  const handleShare = async () => {
    if (!event) return;
    
    try {
      await Share.share({
        message: `¡Mira este evento! ${event.name} en ${event.bar?.name}. ${event.description}`,
        title: event.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOpenMaps = () => {
    if (!event?.location) return;
    
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(event.location)}`,
      android: `geo:0,0?q=${encodeURIComponent(event.location)}`,
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aquí implementarías la lógica para guardar/quitar de favoritos
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando evento...</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <Icon name="event-busy" size={64} color={colors.error} />
        <Text style={styles.errorText}>Evento no encontrado</Text>
        <Text style={styles.errorSubtext}>El evento que buscas no existe o ha sido eliminado</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
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
        {/* Header Image with Overlay */}
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: event.image || 'https://via.placeholder.com/400x300?text=No+Image' }}
            style={styles.headerImage}
            resizeMode="cover"
          />
          <View style={styles.headerOverlay}>
            <TouchableOpacity 
              style={styles.backIconButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={toggleFavorite}
              >
                <Icon 
                  name={isFavorite ? "favorite" : "favorite-border"} 
                  size={24} 
                  color={isFavorite ? colors.error : colors.text} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Icon name="share" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Event Status Badge */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{getDaysDifference(event.start)}</Text>
          </View>
          
          {/* Price Badge */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>
              {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Gratis'}
            </Text>
          </View>
        </View>

        {/* Event Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.eventName}>{event.name}</Text>
          
          {/* Bar Info */}
          <TouchableOpacity style={styles.barInfo}>
            <Icon name="local-bar" size={20} color={colors.primary} />
            <Text style={styles.barName}>{event.bar?.name || "Bar no disponible"}</Text>
            <Icon name="arrow-forward-ios" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Event Details Cards */}
          <View style={styles.detailsContainer}>
            {/* Date & Time Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Icon name="event" size={24} color={colors.primary} />
                <Text style={styles.detailTitle}>Fecha y Hora</Text>
              </View>
              <Text style={styles.detailText}>
                {formatDate(event.start)}
              </Text>
              <Text style={styles.detailSubtext}>
                {formatTime(event.start)} - {formatTime(event.end)}
              </Text>
            </View>

            {/* Location Card */}
            <TouchableOpacity 
              style={styles.detailCard}
              onPress={handleOpenMaps}
            >
              <View style={styles.detailHeader}>
                <Icon name="location-on" size={24} color={colors.accent} />
                <Text style={styles.detailTitle}>Ubicación</Text>
                <Icon name="open-in-new" size={16} color={colors.textMuted} />
              </View>
              <Text style={styles.detailText}>{event.location}</Text>
              <Text style={styles.detailSubtext}>Toca para abrir en mapas</Text>
            </TouchableOpacity>

            {/* Price Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Icon name="attach-money" size={24} color={colors.success} />
                <Text style={styles.detailTitle}>Precio</Text>
              </View>
              <Text style={styles.detailText}>
                {event.price > 0 ? `$${event.price.toFixed(2)}` : 'Entrada gratuita'}
              </Text>
              <Text style={styles.detailSubtext}>
                {event.price > 0 ? 'Por persona' : 'No se requiere pago'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.primaryButton}>
              <Icon name="event-available" size={20} color={colors.text} />
              <Text style={styles.primaryButtonText}>Asistir al evento</Text>
            </TouchableOpacity>
            
            <View style={styles.secondaryButtons}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleOpenMaps}
              >
                <Icon name="directions" size={20} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>Direcciones</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleShare}
              >
                <Icon name="share" size={20} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>Compartir</Text>
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    paddingBottom: 32,
  },
  headerContainer: {
    position: 'relative',
    height: isTablet ? 350 : 280,
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
  statusBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 70,
    left: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 20,
  },
  eventName: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    lineHeight: isTablet ? 40 : 36,
  },
  barInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  barName: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  detailsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  detailCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  detailText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  detailSubtext: {
    fontSize: 14,
    color: colors.textMuted,
  },
  descriptionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  actionButtonsContainer: {
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EventDetailsScreen;