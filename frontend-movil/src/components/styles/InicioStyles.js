import { StyleSheet } from 'react-native';

export const inicioStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  
                    // Título centrado
         greeting: {
           fontSize: 36,
           fontWeight: 'bold',
           color: '#8B5CF6',
           marginBottom: 5,
           textAlign: 'center',
           paddingTop: 80,
           paddingBottom: 20,
           width: '100%',
         },
           subGreeting: {
           fontSize: 18,
           color: '#A78BFA',
           textAlign: 'center',
           width: '100%',
         },
  
  // Botón de notificaciones - Completamente independiente del header
  notificationButton: {
    position: 'absolute',
    right: 20,
    top: 40,
    zIndex: 999,
    width: 45,
    height: 45,
  },
  bellIcon: {
    width: 45,
    height: 45,
    backgroundColor: '#FCD34D',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
           // Contenido principal
         mainContent: {
           paddingHorizontal: 20,
           paddingTop: 0,
           position: 'relative',
         },
  
  // Burbujas del fondo
  backgroundBubble: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.1,
  },
           bubble1: {
           width: 100,
           height: 100,
           backgroundColor: '#9281BF',
           top: 50,
           right: 30,
         },
         bubble2: {
           width: 80,
           height: 80,
           backgroundColor: '#A78BFA',
           top: 200,
           left: 20,
         },
         bubble3: {
           width: 60,
           height: 60,
           backgroundColor: '#C4B5FD',
           top: 350,
           right: 50,
         },
  
  // Widget principal - Este día
           weekWidget: {
           marginTop: 20,
           marginBottom: 30,
           borderRadius: 20,
           overflow: 'hidden',
           backgroundColor: '#C4B5FD',
           shadowColor: '#C4B5FD',
           shadowOffset: {
             width: 0,
             height: 8,
           },
           shadowOpacity: 0.3,
           shadowRadius: 12,
           elevation: 10,
         },
         weekGradient: {
           padding: 28,
           position: 'relative',
         },
           weekContent: {
           flexDirection: 'row',
           justifyContent: 'space-between',
           alignItems: 'center',
         },
      weekLeftContent: {
  flex: 1,
  paddingRight: 15, // ✅ Más espacio entre contenido y botón
  maxWidth: '75%', // ✅ Limitar ancho para dar espacio al botón
},
  weekTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  weekStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekPercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
verButton: {
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  width: 40,
  height: 40,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1.5,
  borderColor: 'rgba(255, 255, 255, 0.5)',
  marginRight: 10, // ✅ CLAVE: Separación del borde derecho
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
},
  verButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  
  // Widgets pequeños
  smallWidgetsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    position: 'relative',
  },
           smallWidget: {
           flex: 1,
           backgroundColor: '#A7F3D0',
           borderRadius: 20,
           padding: 22,
           marginHorizontal: 8,
           shadowColor: '#000',
           shadowOffset: {
             width: 0,
             height: 4,
           },
           shadowOpacity: 0.15,
           shadowRadius: 8,
           elevation: 8,
           borderWidth: 2,
           borderColor: 'white',
         },
           widgetTitle: {
           fontSize: 18,
           fontWeight: 'bold',
           color: 'white',
           marginBottom: 18,
           textAlign: 'center',
         },
         widgetContent: {
           flexDirection: 'row',
           alignItems: 'center',
           marginBottom: 15,
         },
         widgetAmount: {
           fontSize: 22,
           fontWeight: 'bold',
           color: 'white',
           flex: 1,
           textAlign: 'center',
         },
  progressBar: {
    width: 10,
    height: 70,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressFill: {
    width: '100%',
    borderRadius: 5,
  },
  irButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    alignSelf: 'center',
    marginTop: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  irButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Sección de pendientes
  pendientesSection: {
    marginBottom: 30,
  },
           pendientesTitle: {
           fontSize: 22,
           fontWeight: 'bold',
           color: 'white',
           marginBottom: 18,
         },
  pendientesCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pendientesText: {
    fontSize: 18,
    color: '#8B5CF6',
    flex: 1,
  },
  pendientesAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  pendientesNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginRight: 8,
  },
  verTodoText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },

  // Gestión de Límites
  limitsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  limitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  limitsButtons: {
    gap: 12,
  },
  limitButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  limitButtonIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginRight: 15,
  },
  limitButtonContent: {
    flex: 1,
  },
  limitButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  limitButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  logoutButtonTop: {
    position: 'absolute',
    left: 20,
    top: 40,
    zIndex: 999,
    width: 45,
    height: 45,
  },
  logoutIcon: {
    width: 45,
    height: 45,
    backgroundColor: '#EF4444',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
