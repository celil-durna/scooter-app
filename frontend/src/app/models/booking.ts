export interface Booking {
  id: number;
  userId: number;
  scooterId: number;
  hours: number;
  totalPrice: number;
  bookingTime: string;
  returnTime: string;
  Scooter: {
    id: number;
    Product: {
      name: string;
      image: string;
    }
  };
}
