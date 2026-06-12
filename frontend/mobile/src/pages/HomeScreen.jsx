import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/userSlice';
import { getToken } from 'firebase/app-check';
import { appCheck } from '../firebase';

export default function HomeScreen() {
  const user = useSelector(selectUser);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    if (!user || !user.uid) {
      Alert.alert('Error', 'User is not authenticated.');
      return;
    }

    setSubmitting(true);

    // Dynamic base URL for iOS simulator vs Android emulator
    const baseUrl = Platform.select({
      ios: 'http://localhost:5001',
      android: 'http://10.0.2.2:5001',
      default: 'http://localhost:5001'
    });

    // Retrieve the App Check token first
    getToken(appCheck)
      .then((appCheckTokenResult) => {
        const appCheckToken = appCheckTokenResult.token;

        return fetch(`${baseUrl}/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Firebase-AppCheck': appCheckToken,
          },
          body: JSON.stringify({
            uid: user.uid,
            username: formData.name.trim(),
            email: formData.email.trim(),
            phonenumber: formData.phone.trim(),
          }),
        });
      })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errData) => {
            throw new Error(errData.error || 'Server error occurred');
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('Successfully submitted details to backend:', data);
        setSubmitted(true);
      })
      .catch((error) => {
        Alert.alert('Submission Failed', error.message);
      })
      .finally(() => {
        setSubmitting(false);
      });

  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Contact Information</Text>

          {submitted ? (
            <View style={styles.successContainer}>
              <Text style={styles.successTitle}>Thank you!</Text>
              <Text style={styles.successText}>Your information has been successfully submitted.</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '' });
                }}
              >
                <Text style={styles.resetButtonText}>Submit Another Response</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(val) => handleChange('name', val)}
                  placeholder="John Doe"
                  placeholderTextColor="#999"
                  editable={!submitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(val) => handleChange('email', val)}
                  placeholder="john@example.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!submitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(val) => handleChange('phone', val)}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  editable={!submitting}
                />
              </View>

              {submitting ? (
                <ActivityIndicator size="large" color="#0d6efd" style={{ marginTop: 12 }} />
              ) : (
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderColor: '#dee2e6',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#212529',
    backgroundColor: '#f8f9fa',
  },
  submitButton: {
    height: 48,
    backgroundColor: '#0d6efd',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#198754',
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  resetButton: {
    height: 40,
    borderColor: '#198754',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#198754',
  },
});
