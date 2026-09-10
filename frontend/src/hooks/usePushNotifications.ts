import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { api } from '../Config/Api';

export const usePushNotifications = (jwt: string | null, role: string | null) => {
  useEffect(() => {
    if (!jwt || !role) return;

    // Only run on actual devices (Android/iOS), not in standard web browser
    if (Capacitor.isNativePlatform()) {
      registerPush();
    }

  }, [jwt, role]);

  const registerPush = async () => {
    try {
      // Request permissions
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('User denied push notification permissions');
        return;
      }

      // Register with Apple / Google to receive token
      await PushNotifications.register();

      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        // Send token to our backend
        try {
          await api.post('/api/notifications/register-token', {
            fcmToken: token.value,
            role: role
          }, {
            headers: { Authorization: `Bearer ${jwt}` }
          });
          console.log('Token successfully registered with backend');
        } catch (error) {
          console.error('Failed to register token with backend:', error);
        }
      });

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
        // You can add an in-app toast or snackbar here if desired
      });

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      });

    } catch (e) {
      console.error('Error setting up push notifications:', e);
    }
  };
};
