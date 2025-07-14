/**
 * @file components/MenuModal.tsx
 * @description Animated menu modal with user mode switching
 * @features - Blur backdrop, user mode dropdown, navigation links
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Settings, Gift, User, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  userModeDropdown: boolean;
  setUserModeDropdown: (show: boolean) => void;
  currentMode: 'Personnel' | 'Business';
  onModeSwitch: (mode: 'Personnel' | 'Business') => void;
  menuAnimation: Animated.Value;
  backdropAnimation: Animated.Value;
}

export default function MenuModal({
  visible,
  onClose,
  userModeDropdown,
  setUserModeDropdown,
  currentMode,
  onModeSwitch,
  menuAnimation,
  backdropAnimation,
}: MenuModalProps) {
  const { theme, currentTheme } = useTheme();

  const MenuBackdrop = () => (
    <BlurView
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: 'rgba(0,0,0,0.2)',
        }
      ]}
      intensity={8}
      tint={currentTheme === 'dark' ? 'dark' : 'light'}
    />
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.backdropBlur,
            {
              opacity: backdropAnimation,
            }
          ]}
        >
          <MenuBackdrop />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.menuContainer,
          {
            backgroundColor: theme.colors.surface,
            transform: [
              {
                translateY: menuAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-300, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.menuHeader}>
          <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Menu</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuItems}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setUserModeDropdown(!userModeDropdown)}
          >
            <User size={20} color="#8b5cf6" />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
              User Mode
            </Text>
          </TouchableOpacity>

          {userModeDropdown && (
            <View style={styles.userModeDropdown}>
              <TouchableOpacity
                style={[
                  styles.userModeOption,
                  currentMode === 'Personnel' && styles.activeMode
                ]}
                onPress={() => onModeSwitch('Personnel')}
              >
                <Text style={[styles.userModeText, { color: theme.colors.text }]}>
                  Personnel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.userModeOption,
                  currentMode === 'Business' && styles.activeMode
                ]}
                onPress={() => onModeSwitch('Business')}
              >
                <Text style={[styles.userModeText, { color: theme.colors.text }]}>
                  Business
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push('/invite');
            }}
          >
            <Gift size={20} color="#10b981" />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
              Invite Friends
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              router.push('/settings');
            }}
          >
            <Settings size={20} color="#6b7280" />
            <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  backdropBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    right: 20,
    left: 20,
    marginTop: 100,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuItems: {
    padding: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
  },
  userModeDropdown: {
    marginLeft: 35,
    marginBottom: 10,
  },
  userModeOption: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 2,
  },
  activeMode: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  userModeText: {
    fontSize: 14,
  },
});