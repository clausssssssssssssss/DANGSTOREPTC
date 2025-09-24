import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
// Escalado responsivo simple por tipo de dispositivo
const isTablet = Math.min(width, height) >= 768;
const isSmallPhone = width < 360;
const isMediumPhone = width >= 360 && width < 400;
const isLargePhone = width >= 400 && !isTablet;

// Factor de escala (reducimos tamaños generales, card y fuentes)
const baseScale = isTablet ? 0.9 : (isSmallPhone ? 0.85 : (isMediumPhone ? 0.9 : (isLargePhone ? 0.95 : 0.92)));

// Ancho máximo de card según dispositivo para mantenerla más compacta
const cardMaxWidth = isTablet ? Math.min(520, width * 0.6) : Math.min(420, width * 0.9);

const AuthAppStyles = StyleSheet.create({
  safeArea: { 
    flex: 1 
  },
  container: {
    flex: 1,
    position: 'relative',
    paddingBottom: Platform.OS === 'android' ? 20 : 0
  },
  content: {
    flexGrow: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Math.max(14, width * 0.045),
    paddingVertical: Math.max(16, 20 * baseScale)
  },
  pageTitle: { 
    marginTop: 2,
    marginBottom: 25,
    color: '#FFFFFF',
    fontSize: Math.max(22, width * 0.065 * baseScale), 
    fontWeight: '800', 
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)', 
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: Platform.select({ ios: 'HelveticaNeue', android: 'sans-serif-medium' })
  },
  cornerTopLeft: {
    position: 'absolute',
    top: -height * 0.01,
    left: -width * 0.32,
    width: Math.max(200, width * 0.20),
    height: Math.max(200, width * 0.50),
    opacity: 1,
    transform: [{ rotate: '-18deg' }],
  },
  cornerTopRight: {
    position: 'absolute',
    top: -height * 0.16,
    right: -width * 0.16,
    width: Math.max(50, width * 0.88),
    height: Math.max(300, width * 0.78),
    opacity: 1,
    transform: [{ rotate: '1deg' }],
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: Math.max(12, height * 0.02),
    right: -width * 0.18,
    width: Math.max(170, width * 0.42),
    height: Math.max(170, width * 0.42),
    opacity: 0.95,
    transform: [{ scaleX: -1 }, { rotate: '-8deg' }],
  },
  card: { 
    width: Math.min(width * 0.9, cardMaxWidth), 
    backgroundColor: '#FFFFFF',
    borderRadius: 16, 
    paddingTop: Math.max(18, height * 0.02 * baseScale),
    paddingBottom: Math.max(26, height * 0.028 * baseScale),
    paddingHorizontal: Math.max(16, width * 0.055 * baseScale), 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.22, 
    shadowRadius: 34, 
    elevation: 12 
  },
  logo: { 
    alignSelf: 'center', 
    width: 72 * baseScale, 
    height: 82 * baseScale, 
    marginBottom: Math.max(4, 6 * baseScale), 
    marginTop: -6 
  },
  label: { 
    color: '#5A48D8', 
    fontSize: Math.max(10, 12 * baseScale), 
    fontWeight: '600', 
    marginBottom: Math.max(4, 6 * baseScale) 
  },
  field: { 
    width: '100%',
    height: Math.max(42, 50 * baseScale), 
    backgroundColor: '#ECEAF5', 
    borderRadius: 10, 
    paddingHorizontal: Math.max(12, 16 * baseScale), 
    fontSize: Math.max(12, 14 * baseScale), 
    color: '#1F2937', 
    borderWidth: 1, 
    borderColor: 'transparent' 
  },
  inputError: { 
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2' 
  },
  passwordRow: { 
    position: 'relative' 
  },
  passwordField: { 
    paddingRight: Math.max(30, 38 * baseScale) 
  },
  eyeButton: { 
    position: 'absolute', 
    right: 7, 
    top: Math.max(8, 10 * baseScale), 
    width: Math.max(24, 30 * baseScale), 
    height: Math.max(24, 28 * baseScale), 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Math.max(8, 12 * baseScale),
    marginBottom: Math.max(12, 16 * baseScale)
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    width: Math.max(14, 18 * baseScale),
    height: Math.max(14, 18 * baseScale),
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  checked: {
    backgroundColor: '#5A48D8',
    borderColor: '#5A48D8'
  },
  checkmark: {
    color: 'white',
    fontSize: Math.max(10, 12 * baseScale),
    fontWeight: 'bold'
  },
  rememberText: {
    color: '#6B7280',
    fontSize: Math.max(11, 13 * baseScale)
  },
  forgotText: {
    color: '#5A48D8',
    fontSize: Math.max(10, 12 * baseScale),
    fontWeight: '500'
  },
  cta: { 
    marginTop: 8 
  },
  ctaBg: { 
    height: Math.max(42, 50 * baseScale), 
    borderRadius: 10, 
    alignItems: 'center',
    justifyContent: 'center', 
    shadowColor: '#8A79FF', 
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12, 
    elevation: 6 
  },
  ctaText: { 
    color: '#FFFFFF',
    fontSize: Math.max(14, 16 * baseScale), 
    fontWeight: '700' 
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: Math.max(10, 12 * baseScale),
    marginTop: Math.max(4, 6 * baseScale),
    fontWeight: '500' 
  },
});

export { AuthAppStyles };
