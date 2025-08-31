import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../context/AuthContext.js';
import { getMaterials, searchMaterials, createMaterial, updateMaterial, deleteMaterial } from '../services/materialService.js';

const { width, height } = Dimensions.get('window');

const Inventario = ({ navigation }) => {
  const [materials, setMaterials] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', type: '', quantity: '', investment: '', dateOfEntry: '' , image: ''});
  const [showDate, setShowDate] = useState(false);

  const API_BASE = 'http://192.168.0.8:4000/api';

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = query.trim() ? await searchMaterials(API_BASE, query.trim()) : await getMaterials(API_BASE);
      setMaterials(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('No se pudieron cargar materiales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(load, 350); return () => clearTimeout(t); }, [query]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return null;
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1,1], quality: 0.8, base64: true });
    if (result.canceled) return null;
    const asset = result.assets?.[0];
    if (!asset?.base64) return null;
    return `data:image/jpeg;base64,${asset.base64}`;
  };

  const resetForm = () => setForm({ name: '', type: '', quantity: '', investment: '', dateOfEntry: '', image: '' });

  const submitCreate = async () => {
    try {
      setLoading(true);
      await createMaterial(API_BASE, {
        name: form.name,
        type: form.type,
        quantity: Number(form.quantity || 0),
        investment: Number(form.investment || 0),
        dateOfEntry: form.dateOfEntry || new Date().toISOString(),
        ...(form.image ? { image: { uri: form.image, name: 'image.jpg', type: 'image/jpeg' } } : {}),
      });
      setShowCreate(false);
      resetForm();
      await load();
    } catch (e) {
      Alert.alert('Error', 'No se pudo crear el material');
    } finally { setLoading(false); }
  };

  const submitUpdate = async () => {
    if (!editItem) return;
    try {
      setLoading(true);
      const updated = await updateMaterial(API_BASE, editItem._id, {
        name: form.name,
        type: form.type,
        quantity: Number(form.quantity || 0),
        investment: Number(form.investment || 0),
        dateOfEntry: form.dateOfEntry || editItem.dateOfEntry,
        ...(form.image ? { image: { uri: form.image, name: 'image.jpg', type: 'image/jpeg' } } : {}),
      });
      Alert.alert('Material actualizado');
      setEditItem(null);
      resetForm();
      await load();
    } catch (e) {
      Alert.alert('Error', e?.message || 'No se pudo actualizar');
    } finally { setLoading(false); }
  };

  const confirmDelete = async (id) => {
    Alert.alert('Eliminar', '¿Estás seguro de eliminar este material?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { 
          setLoading(true); 
          await deleteMaterial(API_BASE, id); 
          // Cerrar modal de edición y limpiar formulario
          setEditItem(null);
          resetForm();
          Alert.alert('Material eliminado');
          await load(); 
        }
        catch { Alert.alert('Error', 'No se pudo eliminar'); }
        finally { setLoading(false); }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventario</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={{ paddingHorizontal: width * 0.05, paddingTop: 12, flex: 1 }}>
        {/* Buscador y botón nuevo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 44, justifyContent: 'center' }}>
            <Text style={{ color: '#9CA3AF', position: 'absolute', left: 12 }}>🔎</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar materiales..."
              placeholderTextColor="#9CA3AF"
              style={{ paddingLeft: 28, color: '#111827' }}
            />
          </View>
          <TouchableOpacity onPress={() => setShowCreate(true)} style={{ marginLeft: 10, backgroundColor: '#8B5CF6', paddingHorizontal: 12, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '700' }}>Nuevo</Text>
          </TouchableOpacity>
        </View>

        {/* Listado */}
        {loading ? (
          <Text style={{ textAlign: 'center', color: '#6B7280' }}>Cargando...</Text>
        ) : error ? (
          <Text style={{ textAlign: 'center', color: '#EF4444' }}>{error}</Text>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {materials.map((m) => (
                <TouchableOpacity key={m._id} style={styles.card} onPress={() => { setEditItem(m); setForm({ name: m.name, type: m.type, quantity: String(m.quantity), investment: String(m.investment), dateOfEntry: m.dateOfEntry?.slice(0,10) || '', image: '' }); }}>
                  <Image source={{ uri: m.image }} style={styles.cardImage} />
                  <View style={{ padding: 10 }}>
                    <Text style={styles.cardTitle}>{m.name}</Text>
                    <Text style={styles.cardMeta}>Tipo: {m.type}</Text>
                    <Text style={styles.cardMeta}>Stock: {m.quantity} • Inversión: {m.investment}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Modal Crear */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Nuevo material</Text>
            <TouchableOpacity onPress={async () => { const img = await handlePickImage(); if (img) setForm({ ...form, image: img }); }} style={{ alignSelf: 'center', marginBottom: 12 }}>
              <Image source={{ uri: form.image || 'https://via.placeholder.com/120' }} style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: '#F3F4F6' }} />
            </TouchableOpacity>
            <TextInput placeholder="Nombre" value={form.name} onChangeText={(t)=>setForm({ ...form, name: t })} style={styles.input} />
            <TextInput placeholder="Tipo" value={form.type} onChangeText={(t)=>setForm({ ...form, type: t })} style={styles.input} />
            <TextInput placeholder="Stock" keyboardType="numeric" value={form.quantity} onChangeText={(t)=>setForm({ ...form, quantity: t })} style={styles.input} />
            <TextInput placeholder="Inversión" keyboardType="numeric" value={form.investment} onChangeText={(t)=>setForm({ ...form, investment: t })} style={styles.input} />
            <TouchableOpacity onPress={() => setShowDate(true)}>
              <Text style={[styles.input, { textAlignVertical: 'center', paddingTop: 12 }]}>Fecha: {form.dateOfEntry || 'Seleccionar'}</Text>
            </TouchableOpacity>
            {showDate && (
              <DateTimePicker
                value={form.dateOfEntry ? new Date(form.dateOfEntry) : new Date()}
                mode="date"
                onChange={(e, d) => { setShowDate(false); if (d) setForm({ ...form, dateOfEntry: d.toISOString().slice(0,10) }); }}
              />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity onPress={() => { setShowCreate(false); resetForm(); }} style={styles.secondaryBtn}><Text style={styles.secondaryBtnText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity onPress={submitCreate} style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Guardar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar */}
      <Modal visible={!!editItem} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Editar material</Text>
            <TouchableOpacity onPress={async () => { const img = await handlePickImage(); if (img) setForm({ ...form, image: img }); }} style={{ alignSelf: 'center', marginBottom: 12 }}>
              <Image source={{ uri: form.image || editItem?.image || 'https://via.placeholder.com/120' }} style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: '#F3F4F6' }} />
            </TouchableOpacity>
            <TextInput placeholder="Nombre" value={form.name} onChangeText={(t)=>setForm({ ...form, name: t })} style={styles.input} />
            <TextInput placeholder="Tipo" value={form.type} onChangeText={(t)=>setForm({ ...form, type: t })} style={styles.input} />
            <TextInput placeholder="Stock" keyboardType="numeric" value={form.quantity} onChangeText={(t)=>setForm({ ...form, quantity: t })} style={styles.input} />
            <TextInput placeholder="Inversión" keyboardType="numeric" value={form.investment} onChangeText={(t)=>setForm({ ...form, investment: t })} style={styles.input} />
            <TouchableOpacity onPress={() => setShowDate(true)}>
              <Text style={[styles.input, { textAlignVertical: 'center', paddingTop: 12 }]}>Fecha: {form.dateOfEntry || 'Seleccionar'}</Text>
            </TouchableOpacity>
            {showDate && (
              <DateTimePicker
                value={form.dateOfEntry ? new Date(form.dateOfEntry) : new Date()}
                mode="date"
                onChange={(e, d) => { setShowDate(false); if (d) setForm({ ...form, dateOfEntry: d.toISOString().slice(0,10) }); }}
              />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <TouchableOpacity onPress={() => { setEditItem(null); resetForm(); }} style={styles.secondaryBtn}><Text style={styles.secondaryBtnText}>Cerrar</Text></TouchableOpacity>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => confirmDelete(editItem._id)} style={[styles.secondaryBtn, { marginRight: 8 }]}><Text style={[styles.secondaryBtnText, { color: '#EF4444' }]}>Eliminar</Text></TouchableOpacity>
                <TouchableOpacity onPress={submitUpdate} style={styles.primaryBtn}><Text style={styles.primaryBtnText}>Actualizar</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.025,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: Math.max(20, width * 0.06),
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: Math.max(18, width * 0.045),
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
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
    marginRight: 8,
  },
  secondaryBtnText: {
    color: '#374151',
    fontWeight: '700',
  },
  card: {
    width: (width * 0.9 - 12) / 2,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  cardTitle: {
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardMeta: {
    color: '#6B7280',
    fontSize: 12,
  },
});

export default Inventario;  
