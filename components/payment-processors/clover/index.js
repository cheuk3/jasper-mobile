import clover from 'remote-pay-cloud';
import React, {createContext, useContext, useState, useEffect} from 'react';
import {
  useQuery,
  useMutation
} from '@apollo/react-hooks';
import {
  GET_LOCATION
} from '../../../constants/graphql-query';
import {
  UPDATE_ORDER,
  SET_CHECKOUT_SUCCESS
} from '../../../constants/graphql-mutation';
import LoadingContainer from '../../LoadingContainer';
import {
  toDisplayOrder,
  toSaleRequest,
  toEnterInputOption,
  toEscInputOption,
  toLineItemsPayload,
  toCustomerReceipt,
  delay
} from './utils';

class POSCloverConnectorListener extends clover.sdk.remotepay.ICloverConnectorListener{
    constructor({
      notifySaleSuccess,
      notifyConnected,
      notifyDisconnected
    }) {
      super();
      this.notifySaleSuccess = notifySaleSuccess;
      this.notifyConnected = notifyConnected;
      this.notifyDisconnected = notifyDisconnected;
    }

    onDeviceConnected(){
      console.log('onDeviceConnected');
    }

    onDeviceDisconnected(){
      console.log('onDeviceDisconnected');
      this.notifyDisconnected();
    }

    onDeviceError(deviceErrorEvent){
      console.log('onDeviceError', deviceErrorEvent);
    }

    onDeviceReady(merchantInfo){
      console.log("ready")
      this.notifyConnected();
    }

    onSaleResponse(response) {
      this.notifySaleSuccess(response);
    }

}


export class CloverConnection {
    constructor(){
      this.cloverConnector = null;
      this.connected = false;
      this.applicationId = '17GTAPT6R62MP';

      this.onSaleResponse = null;
    }

    setOnSaleResponse = (onSaleResponse) => {
      this.onSaleResponse = onSaleResponse;
    }

    onSaleSuccess = (response) => {
      if (this.onSaleResponse) {
        this.onSaleResponse(response);
      }
    }

    onDeviceConnected = () => {
      this.connected = true;
    }

    onDeviceDisconnected = () => {
      this.connected = false;
    }

    async connectToDeviceCloud(accessToken, merchantId, deviceId) {
        console.log('connecting.....', accessToken, merchantId, deviceId);
        let factoryConfig = {};
        factoryConfig[clover.CloverConnectorFactoryBuilder.FACTORY_VERSION] = clover.CloverConnectorFactoryBuilder.VERSION_12;
        let cloverConnectorFactory = clover.CloverConnectorFactoryBuilder.createICloverConnectorFactory(factoryConfig);

        const cloudConfigurationBuilder = new clover.WebSocketCloudCloverDeviceConfigurationBuilder(this.applicationId, deviceId, merchantId, accessToken);
        const cloudConfiguration = cloudConfigurationBuilder.setCloverServer("https://sandbox.dev.clover.com/")
            .setFriendlyId('')
            .setForceConnect(false)
            .setHeartbeatInterval(1000)
            .setHeartbeatDisconnectTimeout(3000)
            .setReconnectDelay(3000)
            .build();
        this.cloverConnector = cloverConnectorFactory.createICloverConnector(cloudConfiguration);

        let connectorListener = new POSCloverConnectorListener({
          notifySaleSuccess: this.onSaleSuccess,
          notifyConnected: this.onDeviceConnected,
          notifyDisconnected: this.onDeviceDisconnected
        });

        this.cloverConnector.addCloverConnectorListener(connectorListener);
        this.cloverConnector.initializeConnection();
    }
}

const CloverContext = createContext();
export const CloverProvider = ({children}) => {
  const { data: locationData } = useQuery(GET_LOCATION);
  const [ clover, setClover ] = useState(null);

  const location = locationData && locationData.location;
  useEffect(() => {
    if (location) {
      const cloverConnection = new CloverConnection();
      cloverConnection.connectToDeviceCloud("02f99667-7967-3839-490a-ffb9c842af97", "NHB4X5ZMNBPJ1", "7354c7fb-8de6-07fa-110e-9c34b69d0ead");
      setClover(cloverConnection);
    }
  }, [location]);
  return (
    <CloverContext.Provider value={{clover}}>
      {children}
    </CloverContext.Provider>
  );
};
export const useClover = () => useContext(CloverContext);

export function OrderDisplayView({ cart, taxes, tipPercentage }) {
  const { clover } = useClover();
  if (clover) {
    clover.cloverConnector.showDisplayOrder(toDisplayOrder(cart, taxes, tipPercentage));
  }
  return null;
}

export function CancellingSaleView() {
  const { clover } = useClover();
  useEffect(() => {
    if (clover) {
      // escaping from sales view
      clover.cloverConnector.invokeInputOption(toEnterInputOption());
      setTimeout(() => {
        clover.cloverConnector.invokeInputOption(toEscInputOption());
      }, 1000);
    }
  }, [])
  return <LoadingContainer />;
}

export function LandingView() {
  const { clover } = useClover();
  if (clover) {
    // show welcome view
    clover.cloverConnector.showWelcomeScreen();
  }

  return null;
}

export function PaymentView({ cart, taxes, tipPercentage }) {
  const { clover } = useClover();
  const { data: locationData } = useQuery(GET_LOCATION);
  const [ updateOrder ] = useMutation(UPDATE_ORDER);
  const [ setCheckoutSuccess ] = useMutation(SET_CHECKOUT_SUCCESS);
  const printCloverReceipt = async (payment) => {
    // print clover receipt
    const receipt = toCustomerReceipt(
      cart,
      taxes,
      tipPercentage,
      payment,
      locationData ? locationData.location : null
    );
    for (i = 0; i < 3; i++) {
      if (clover.connected) {
        clover.cloverConnector.print(receipt);
        break;
      }
      await delay(2000);
    }
  }
  const showThankyouScreen = async () => {
    for (i = 0; i < 3; i++) {
      if (clover.connected) {
        clover.cloverConnector.showWelcomeScreen();
        setCheckoutSuccess({
          refetchQueries: ["GetCheckoutState"]
        });
        break;
      }
      await delay(2000);
    }
  }
  const onSaleResponse = (response) => {
    if (response.success) {
      const orderId = response.payment.order.id;
      const lineItems = toLineItemsPayload(cart);
      console.log(lineItems);
      updateOrder({
        variables: {
          orderId,
          lineItems
        }
      }).then(({
        code
      }) => {
      }).catch((e) => {
      });

      printCloverReceipt(response.payment);
      showThankyouScreen();

    } else {
      // error
    }
  }

  useEffect(() => {
    clover.setOnSaleResponse(onSaleResponse);
    clover.cloverConnector.sale(toSaleRequest(cart, taxes, tipPercentage));
  }, [])

  return null;
}
