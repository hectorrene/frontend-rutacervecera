import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BarsStackParamList } from '../../../navigation/userNavigation';
import BusinessService from '../../../services/BusinessService';

interface Bar {
  _id: string;
  name: string;
  description?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone?: string;
  type?: string[];
}

const BusinessDashboardScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<BarsStackParamList>>();
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar bares al entrar a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      loadBars();
    }, [])
  );

  const loadBars = async () => {
    try {
      setLoading(true);
      const response = await BusinessService.getMyBars();
      setBars(response.data || []);
    } catch (error) {
      console.error('Error cargando bares:', error);
      Alert.alert('Error', 'No se pudieron cargar los bares');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBars();
    setRefreshing(false);
  };

  const handleBarPress = (bar: Bar) => {
    navigation.navigate('BarDetails', { barId: bar._id });
  };

//   const handleCreateBar = () => {
//     navigation.navigate('CreateBar');
//   };

  const renderBarItem = ({ item }: { item: Bar }) => (
    <TouchableOpacity 
      style={styles.barCard}
      onPress={() => handleBarPress(item)}
    >
      <View style={styles.barInfo}>
        <Text style={styles.barName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.barDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.address && (
          <Text style={styles.barAddress}>
            {[item.address.street, item.address.city, item.address.state, item.address.zipCode].filter(Boolean).join(', ')}
          </Text>
        )}
        <View style={styles.barTypes}>
          {item.type?.map((type, index) => (
            <View key={index} style={styles.typeTag}>
              <Text style={styles.typeText}>{type}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>¡Bienvenido a tu Panel de Negocios!</Text>
      <Text style={styles.emptySubtitle}>
        Aún no tienes bares registrados.{'\n'}
        Crea tu primer bar para comenzar.
      </Text>
      {/* <TouchableOpacity style={styles.createFirstButton} onPress={handleCreateBar}> */}
        <Text style={styles.createFirstButtonText}>Crear Mi Primer Bar</Text>
      {/* </TouchableOpacity> */}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando tus bares...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Bares</Text>
        {bars.length > 0 && (
        //   <TouchableOpacity style={styles.addButton} onPress={handleCreateBar}>
            <Text style={styles.addButtonText}>+ Agregar Bar</Text>
        //   </TouchableOpacity>
        )}
      </View>

      {bars.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={bars}
          keyExtractor={(item) => item._id}
          renderItem={renderBarItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  barCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  barInfo: {
    flex: 1,
  },
  barName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  barDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 6,
    lineHeight: 20,
  },
  barAddress: {
    fontSize: 12,
    color: '#868e96',
    marginBottom: 8,
  },
  barTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 12,
    color: '#495057',
  },
  arrow: {
    fontSize: 20,
    color: '#adb5bd',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BusinessDashboardScreen;