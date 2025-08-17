import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const API_BASE = 'http://192.168.0.8:4000/api';

const Notificaciones = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [price, setPrice] = useState('');
  const [comment, setComment] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/custom-orders/pending`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('No se pudieron cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const quote = async (id, price, comment) => {
    try {
      const res = await fetch(`${API_BASE}/custom-orders/${id}/quote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, comment }),
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Cotización enviada');
      await load();
    } catch (e) {
      Alert.alert('Error', 'No se pudo enviar cotización');
    }
  };

  const reject = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/custom-orders/${id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'reject' }),
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Orden rechazada');
      await load();
    } catch (e) {
      Alert.alert('Error', 'No se pudo rechazar');
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Órdenes pendientes</Text>
        <Text style={styles.menuBtn}>⋮</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : error ? (
        <Text style={{ color: '#fff', textAlign: 'center' }}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {orders.map((o) => (
            <TouchableOpacity key={o._id} style={styles.ordenCard} onPress={() => { setSelected(o); setPrice(String(o.price || '')); setComment(o.comment || ''); }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombre}>{o.user?.name || 'Usuario'}</Text>
                <Text style={styles.cantidad}>{o.modelType}</Text>
              </View>
              <Text style={styles.alerta}>⋯</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <QuoteModal
        visible={!!selected}
        order={selected}
        price={price}
        setPrice={setPrice}
        comment={comment}
        setComment={setComment}
        onClose={() => { setSelected(null); setPrice(''); setComment(''); }}
        onSend={async () => { await quote(selected._id, Number(price || 0), comment); setSelected(null); setPrice(''); setComment(''); }}
        onReject={async () => { await reject(selected._id); setSelected(null); setPrice(''); setComment(''); }}
      />
    </View>
  );
};

// Modal de cotización
const QuoteModal = ({ visible, onClose, order, onSend, onReject, price, setPrice, comment, setComment }) => {
  if (!order) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 16 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' }}>
          <Image source={{ uri: order.imageUrl?.startsWith('http') ? order.imageUrl : `http://192.168.0.8:4000${order.imageUrl}` }} style={{ width: '100%', height: 180 }} />
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 6 }}>{order.description || 'Encargo personalizado'}</Text>
            <Text style={{ color: '#6B7280', marginBottom: 12 }}>Tipo: {order.modelType}</Text>
            <TextInput placeholder="Asignar precio" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
            <TextInput placeholder="Comentario (opcional)" value={comment} onChangeText={setComment} style={styles.input} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <TouchableOpacity onPress={onReject} style={styles.secondaryBtn}><Text style={[styles.secondaryBtnText, { color: '#EF4444' }]}>Rechazar</Text></TouchableOpacity>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={onClose} style={[styles.secondaryBtn, { marginRight: 8 }]}><Text style={styles.secondaryBtnText}>Cerrar</Text></TouchableOpacity>
                <TouchableOpacity onPress={onSend} style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Enviar</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
	bg: {
		flex: 1,
		backgroundColor: '#b39ddb',
		paddingTop: 40,
		paddingHorizontal: 12,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 18,
		justifyContent: 'space-between',
	},
	backBtn: {
		fontSize: 24,
		color: '#fff',
		paddingHorizontal: 8,
		fontWeight: 'bold',
	},
	headerTitle: {
		fontSize: 24,
		color: '#fff',
		fontWeight: 'bold',
		flex: 1,
		textAlign: 'center',
		marginRight: 24,
	},
	menuBtn: {
		fontSize: 24,
		color: '#fff',
		paddingHorizontal: 8,
	},
	scrollContent: {
		paddingBottom: 30,
	},
	ordenCard: {
		backgroundColor: '#d1c4e9',
		borderRadius: 14,
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 16,
		paddingHorizontal: 18,
		marginBottom: 12,
		justifyContent: 'space-between',
	},
	nombre: {
		fontSize: 18,
		color: '#4b3ca7',
		fontWeight: 'bold',
		flex: 1,
	},
	cantidad: {
		fontSize: 18,
		color: '#4b3ca7',
		fontWeight: 'bold',
		marginHorizontal: 16,
	},
	alerta: {
		fontSize: 22,
		fontWeight: 'bold',
	},
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
    color: '#111827',
  },
  primaryBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#374151',
    fontWeight: '700',
  },
});

export default Notificaciones;	