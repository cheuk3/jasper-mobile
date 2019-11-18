import React, { useState, useEffect, useRef } from "react"
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from "react-native"
import {
  withTheme,
  Button,
  Image
} from "@draftbit/ui"
import { useQuery, useMutation } from '@apollo/react-hooks';
import v4 from 'uuid/v4';
import {
  GET_NEWLY_ADDED_ITEMS
} from '../constants/graphql-query';
import {
  CLEAR_NOTIFICATION_QUEUE
} from '../constants/graphql-mutation';

import MenuItem from "./MenuItem";
import ModalContainer from './ModalContainer';


function NotificationCellContainer({ children }) {
  const notificationAnimated = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(notificationAnimated, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease
    }).start();
  }, []);
  return (
    <Animated.View
      style={{
        right: notificationAnimated.interpolate({
          inputRange: [0, 1],
          outputRange: [-300, 0]
        })
      }}
    >
      {children}
    </Animated.View>
  );
}

function NewItemNotification({ title }) {
  const textAnimated = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(textAnimated, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease
    }).start();
  }, []);

  return (
    <View
      style={[
        styles.Notification_Common,
        {
          backgroundColor: "#22c981"
        }
      ]}
    >
      <Image
        style={{ height: 70, width: 100 }}
        source={require('../assets/images/newitem.png')}
      />
      <Animated.Text
        style={{
          fontSize: 24,
          fontWeight: "600",
          color: "#fff",
          bottom: textAnimated.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, 0]
          })
        }}
      >
        {title} Added
      </Animated.Text>
    </View>
  );
}

function Notification() {
  const [ clearNotificationQueue ] = useMutation(CLEAR_NOTIFICATION_QUEUE);
  const { data: { newlyAddedItems } } = useQuery(GET_NEWLY_ADDED_ITEMS);
  const [ newItems, setNewItems ] = useState([]);
  useEffect(() => {
    setTimeout(() => {
      newlyAddedItems.forEach((item) => {
        const notificationId = v4();
        setNewItems([ ...newItems, { ...item, id: notificationId } ]);
        setTimeout(() => {
          setNewItems(newItems.filter(i => i.id !== item.id));
        }, 3000);
      });
      clearNotificationQueue().catch(() => {});
    }, 500);
  }, [newlyAddedItems]);

  return (
    <View style={styles.Notification_Container}>
      {
        newItems.map((item, index) => {
          return (
            <NotificationCellContainer key={`${item}-${index}`}>
              <NewItemNotification title={item.title} />
            </NotificationCellContainer>
          );
        })
      }
    </View>
  );
}

const styles = StyleSheet.create({
  Notification_Container: {
    position: "absolute",
    zIndex: 15,
    right: 50,
    top: 50
  },
  Notification_Common: {
    borderRadius: 500,
    paddingVertical: 12,
    paddingHorizontal: 48,
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.5,
		shadowRadius: 1.00,
  }
})

export default Notification;