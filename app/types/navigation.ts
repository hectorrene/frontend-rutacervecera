export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
  };
  
  export type BarsStackParamList = {
    BarsList: undefined;
    BarDetails: { barId: string; barData?: any };
    MenuItem: { itemId: string; itemData?: any };
  };
  
  export type EventsStackParamList = {
    EventsList: undefined;
    EventDetails: { eventId: string; eventData?: any };
  };
  
  export type ProfileStackParamList = {
    Profile: undefined;
    EditProfile: undefined;
  };