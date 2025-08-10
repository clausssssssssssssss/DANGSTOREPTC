import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ordenes = [
	{ nombre: 'Julieta', cantidad: 1, alerta: 'red' },
	{ nombre: 'Carlos', cantidad: 2, alerta: 'red' },
	{ nombre: 'Allan', cantidad: 3, alerta: 'orange' },
	{ nombre: 'Claudia', cantidad: 4, alerta: 'orange' },
	{ nombre: 'Luis', cantidad: 3, alerta: 'red' },
	{ nombre: 'Samuel', cantidad: 3, alerta: 'red' },
	{ nombre: 'Steven', cantidad: 3, alerta: 'red' },
];

const Notificaciones = () => {
    const navigation = useNavigation();

	return (
		<View style={styles.bg}>
			{/* Header */}
			<View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
					<Text style={styles.backBtn}>{'<'}</Text>
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Ordenes cotizadas</Text>
				<Text style={styles.menuBtn}>⋮</Text>
			</View>
			{/* Lista de órdenes */}
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{ordenes.map((item, idx) => (
					<View key={idx} style={styles.ordenCard}>
						<Text style={styles.nombre}>{item.nombre}</Text>
						<Text style={styles.cantidad}>{item.cantidad}</Text>
						<Text
							style={[
								styles.alerta,
								{ color: item.alerta === 'red' ? '#e53935' : '#ffa726' },
							]}
						>
							{item.alerta === 'red' ? '⚠️' : '⚠️'}
						</Text>
					</View>
				))}
			</ScrollView>
		</View>
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
});

export default Notificaciones;	