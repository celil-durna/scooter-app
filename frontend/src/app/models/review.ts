export interface Review {
    reviewId: number;
    userId: number;
    scooterId: number;
    text: string;
    helpfulCounter: number;
    edited: boolean;
    valuation: number;
    date: Date;
    User: {
      firstName: string;
      lastName: string;
    };
  }
  