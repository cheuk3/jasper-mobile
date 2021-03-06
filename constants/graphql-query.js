import gql from 'graphql-tag';

export const GET_MENU_ITEMS = gql`
query MenuItems{
  menuItems{
    id
    paymentProcessorId
    title
    description
    calories
    pictureURL
    price
    options{
      id
      title
      priority
      required
      maxSelections
      optionValues{
        id
        pictureURL
        price
        title
        priority
        isDefault
        paymentProcessorId
      }
    }
    categories{
      id
      name
    }
    menuItemToUpsell {
      id
      paymentProcessorId
      title
      description
      calories
      pictureURL
      price
      categories{
        id
        name
      }
      options{
        id
        title
        priority
        required
        maxSelections
        optionValues{
          id
          pictureURL
          price
          title
          priority
          isDefault
          paymentProcessorId
        }
      }
    }
  }
}
`;

export const GET_LOCATION = gql`
query GetLocation{
  location{
    name
    pictureURL
    taxes{
      paymentProcessorId
      taxType
      taxAmount
    }
    cloverMetaData{
      merchantId
      accessToken
    }
    tabletDevices{
      headerId
      cloverPaymentDeviceId
      kitchenPrinter{
        ipAddress
      }
      receiptPrinter{
        ipAddress
      }
    }
  }
}
`;

export const GET_MENU_CATEGORIES = gql`
query GetUserCategories{
  location{
    menuCategories{
      id
      name
    }
  }
}
`;

export const GET_CURRENT_MENU_CATEGORY = gql`
query GetCurrentMenuCategory{
  currentMenuCategory @client{
    id
    name
  }
}
`;

export const GET_CART = gql`
query GetCart{
  cart @client{
    id
    paymentProcessorId
    title
    description
    calories
    pictureURL
    price
    categories{
      id
      name
    }
    options{
      id
      title
      priority
      required
      maxSelections
      optionValues{
        id
        pictureURL
        price
        title
        priority
        isDefault
        paymentProcessorId
      }
    }
    form{
      id
      formId
      quantity
      isUpsold
      optionValues{
        id
        pictureURL
        optionId
        price
        title
        priority
        isDefault
        paymentProcessorId
      }
    }
  }
}
`;

export const GET_NEWLY_ADDED_ITEMS = gql`
query GetNewlyAddedItems{
  newlyAddedItems @client{
    title
  }
}
`;

export const GET_CURRENT_MENU_ITEMS = gql`
query GetCurrentMenuItems{
  currentMenuItems @client{
    id
    paymentProcessorId
    title
    description
    calories
    pictureURL
    price
    categories{
      id
      name
    }
    options{
      id
      title
      priority
      required
      maxSelections
      optionValues{
        id
        pictureURL
        price
        title
        priority
        isDefault
        paymentProcessorId
      }
    }
  }
}
`;

export const GET_CURRENT_MENU_ITEM = gql`
query GetCurrentMenuItem{
  isEditingMenuItem @client
  isUpsellingMenuItem @client
  editingMenuItemForm @client{
    id
    formId
    quantity
    optionValues{
      id
      pictureURL
      optionId
      price
      title
      priority
      isDefault
      paymentProcessorId
    }
  }
  currentMenuItem @client{
    id
    paymentProcessorId
    title
    description
    calories
    pictureURL
    price
    categories{
      id
      name
    }
    options{
      id
      title
      priority
      required
      maxSelections
      optionValues{
        id
        pictureURL
        price
        title
        priority
        isDefault
        paymentProcessorId
      }
    }
    menuItemToUpsell{
      id
      paymentProcessorId
      title
      description
      calories
      pictureURL
      price
      categories{
        id
        name
      }
      options{
        id
        title
        priority
        required
        maxSelections
        optionValues{
          id
          pictureURL
          price
          title
          priority
          isDefault
          paymentProcessorId
        }
      }
    }
  }
}
`;

export const GET_EDITING_MENU_ITEM = gql`
query GetEditingMenuItem{
  isEditingMenuItem @client
  isUpsellingMenuItem @client
  editingMenuItemForm @client{
    id
    quantity
    optionValues{
      id
      pictureURL
      formId
      price
      title
      priority
      isDefault
      paymentProcessorId
    }
  }
}
`;

export const GET_TIP_PERCENTAGE = gql`
query GetTipPercentage{
  tipPercentage @client
}
`;

export const GET_CHECKOUT_STATE = gql`
query GetCheckoutState{
  checkoutState @client
}
`;

export const GET_PAYMENT_PROCESSOR_STATUS = gql`
query GetPaymentProcessorStatus{
  paymentProcessorStatus @client
}
`;

export const GET_ORDER_TYPE = gql`
query GetOrderType{
  orderType @client
}
`;
