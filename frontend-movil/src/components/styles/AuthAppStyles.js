import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

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
    paddingHorizontal: Math.max(16, width * 0.05),
    paddingVertical: 20
  },
  pageTitle: { 
    marginTop: 2,
    marginBottom: 25,
    color: '#FFFFFF',
    fontSize: Math.max(26, width * 0.065), 
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
    width: '95%', 
    backgroundColor: '#FFFFFF',
    borderRadius: 16, 
    paddingTop: Math.max(23, height * 0.02),
    paddingBottom: Math.max(36, height * 0.03),
    paddingHorizontal: Math.max(20, width * 0.06), 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.22, 
    shadowRadius: 34, 
    elevation: 12 
  },
  logo: { 
    alignSelf: 'center', 
    width: 75, 
    height: 85, 
    marginBottom: 6, 
    marginTop: -6 
  },
  label: { 
    color: '#5A48D8', 
    fontSize: 12, 
    fontWeight: '600', 
    marginBottom: 6 
  },
  field: { 
    width: '100%',
    height: 50, 
    backgroundColor: '#ECEAF5', 
    borderRadius: 10, 
    paddingHorizontal: 16, 
    fontSize: 14, 
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
    paddingRight: 38 
  },
  eyeButton: { 
    position: 'absolute', 
    right: 7, 
    top: 10, 
    width: 30, 
    height: 28, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    width: 18,
    height: 18,
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
    fontSize: 12,
    fontWeight: 'bold'
  },
  rememberText: {
    color: '#6B7280',
    fontSize: 13
  },
  forgotText: {
    color: '#5A48D8',
    fontSize: 12,
    fontWeight: '500'
  },
  cta: { 
    marginTop: 8 
  },
  ctaBg: { 
    height: 50, 
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
    fontSize: 16, 
    fontWeight: '700' 
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500' 
  },
});

export { AuthAppStyles };
