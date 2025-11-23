import { Request, Response } from 'express';
import { User, UserSession } from './models/user';
import { Review } from './models/review';
import { Like } from './models/like';
import { Booking } from './models/booking';
import Database from './database';


export class ReviewController {

  // neue Review schreiben
  public async createReview(
    request: Request,
    response: Response
  ): Promise<void> {
    console.log('test');
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      response.status(409).send('User is not logged in');
      return;
    }
    const session = await UserSession.findOne({
      where: { sessionId: sessionId },
    });
    if (!session) {
      response.status(404).send('Session not found');
      return;
    }
    const user = await User.findOne({ where: { userId: session.userId } });
    if (!user) {
      response.status(404).send('User not found');
      return;
    }

    const scooterId = request.body.scooterId;
    const text = request.body.text;
    const valuation = request.body.valuation;

    if (!scooterId || !valuation) {
      response.status(400).send('Missing required fields');
      return;
    }

    const existingReview = await Review.findOne({
      where: { userId: user.userId, scooterId: scooterId },
    });
    if (existingReview) {
      response.status(409).send('User already has a Review');
      return;
    }

    const alreadyBookedOnce = await Booking.findOne({
      where: { userId: user.userId, scooterId: scooterId },
    });
    if (!alreadyBookedOnce) {
      response.status(403).send('User did not book it before');
      return;
    }

    const t = await Database.getSequelize().transaction();

    try {
      await Review.create(
        {
          userId: user.userId,
          scooterId: scooterId,
          text: text,
          valuation: valuation,
          edited: false,
          helpfulCounter: 0,
          date: new Date(),
        },
        { transaction: t }
      );
      await t.commit();
      response.status(201).send();
    } catch (error) {
      await t.rollback();
      response.status(500).send('An error occurred while creating the review');
    }
  }

  // Review löschen
  public async deleteReview(request: Request, response: Response): Promise<void> {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      response.status(409).send('User is not logged in');
      return;
    }
    const session = await UserSession.findOne({
      where: { sessionId: sessionId },
    });
    if (!session) {
      response.status(404).send('Session not found');
      return;
    }
    const user = await User.findOne({ where: { userId: session.userId } });
    if (!user) {
      response.status(404).send('User not found');
      return;
    }
  
    const { reviewId } = request.body;
  
    try {
      const review = await Review.findOne({ where: { reviewId } });
  
      if (!review) {
        response.status(404).send('Review not found');
        return;
      }
  
      if (review.userId !== user.userId) {
        response.status(403).send('Users can only delete their own reviews');
        return;
      }
  
      await review.destroy();
  
      response.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting review:', error);
      response.status(500).send('An error occurred while deleting the review');
    }
  }
  

  // überprüfenm ob User einen bestimmten Scooter schon mal gebucht hat
  public async getBookedBefore(
    request: Request,
    response: Response
  ): Promise<void> {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      response.status(409).send('User is not logged in');
      return;
    }
    const session = await UserSession.findOne({
      where: { sessionId: sessionId },
    });
    if (!session) {
      response.status(404).send('Session not found');
      return;
    }
    const user = await User.findOne({ where: { userId: session.userId } });
    if (!user) {
      response.status(404).send('User not found');
      return;
    }
    try {
      const scooterId = request.body.scooterId;
      const alreadyBookedOnce = await Booking.findOne({
        where: { userId: user.userId, scooterId: scooterId },
      });
      response.status(200).send(!!alreadyBookedOnce); // mit !! Object in Boolean umgewandelt -> True/False
    } catch (error) {
      response.status(500).send('Internal Server Error');
    }
  }

  public async hasUserReviewed(
    request: Request,
    response: Response
  ): Promise<void> {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      response.status(409).send('User is not logged in');
      return;
    }
    const session = await UserSession.findOne({
      where: { sessionId: sessionId },
    });
    if (!session) {
      response.status(404).send('Session not found');
      return;
    }
    const user = await User.findOne({ where: { userId: session.userId } });
    if (!user) {
      response.status(404).send('User not found');
      return;
    }
    const scooterId = request.query.scooterId;
    if (!scooterId) {
      response.status(400).send('Missing scooterId');
      return;
    }
    const existingReview = await Review.findOne({
      where: { userId: user.userId, scooterId: scooterId },
    });
    response.status(200).json({ hasReviewed: !!existingReview }); //mit !! Object in Boolean gewandelt -> True/False
  }

 // alle Reviews eines Scooters
  public async getReviewsByScooterId(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const scooterId = request.params.scooterId;

      if (!scooterId) {
        response.status(400).send('Missing scooterId');
        return;
      }

      const reviews = await Review.findAll({
        where: { scooterId: scooterId },
        include: [{ model: User, attributes: ['firstName', 'lastName'] }]
      });

      if (!reviews || reviews.length === 0) {
        response.status(404).send('No reviews found for this scooter');
        return;
      }

      response.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error); // Detaillierte Konsolenausgabe
      response.status(500).send('An error occurred while fetching the reviews');
    }
  }

  
  // Bewertung liken
  public async likeReview(request: Request, response: Response): Promise<void> {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      response.status(409).send('User is not logged in');
      return;
    }
  
    const session = await UserSession.findOne({ where: { sessionId: sessionId } });
    if (!session) {
      response.status(404).send('Session not found');
      return;
    }
  
    const user = await User.findOne({ where: { userId: session.userId } });
    if (!user) {
      response.status(404).send('User not found');
      return;
    }
  
    const { reviewId } = request.body;
  
    try {
      const review = await Review.findOne({ where: { reviewId } });
      if (!review) {
        response.status(404).send('Review not found');
        return;
      }
  
      if (review.userId === user.userId) {
        response.status(403).send('Users cannot like their own reviews');
        return;
      }
  
      const existingLike = await Like.findOne({ where: { userId: user.userId, reviewId: reviewId } });
      if (existingLike) {
        response.status(409).send('Review already liked by user');
        return;
      }
  
      await Like.create({ userId: user.userId, reviewId: reviewId });
      review.helpfulCounter += 1;
      await review.save();
  
      response.status(200).json({ success: true });
    } catch (error) {
      console.error('Error liking review:', error);
      response.status(500).send('An error occurred while liking the review');
    }
  }
  
  // Like einer Bewertung zurückziehen
  public async unlikeReview(request: Request, response: Response): Promise<void> {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      response.status(409).send('User is not logged in');
      return;
    }
  
    const session = await UserSession.findOne({ where: { sessionId: sessionId } });
    if (!session) {
      response.status(404).send('Session not found');
      return;
    }
  
    const user = await User.findOne({ where: { userId: session.userId } });
    if (!user) {
      response.status(404).send('User not found');
      return;
    }
  
    const { reviewId } = request.body;
  
    try {
      const review = await Review.findOne({ where: { reviewId } });
      if (!review) {
        response.status(404).send('Review not found');
        return;
      }
  
      const existingLike = await Like.findOne({ where: { userId: user.userId, reviewId: reviewId } });
      if (!existingLike) {
        response.status(404).send('Like not found');
        return;
      }
  
      await existingLike.destroy();
      review.helpfulCounter -= 1;
      await review.save();
  
      response.status(200).json({ success: true });
    } catch (error) {
      console.error('Error unliking review:', error);
      response.status(500).send('An error occurred while unliking the review');
    }
  }

// überprüfen, ob User eine Review bereits geliket hat
  public async isReviewLiked(request: Request, response: Response): Promise<void> {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      response.status(409).send('User is not logged in');
      return;
    }
  
    const session = await UserSession.findOne({ where: { sessionId: sessionId } });
    if (!session) {
      response.status(404).send('Session not found');
      return;
    }
  
    const user = await User.findOne({ where: { userId: session.userId } });
    if (!user) {
      response.status(404).send('User not found');
      return;
    }
  
    const { reviewId, userId } = request.query;
  
    try {
      const existingLike = await Like.findOne({ where: { userId: Number(userId), reviewId: Number(reviewId) } });
      response.status(200).json({ liked: !!existingLike });
    } catch (error) {
      console.error('Error checking if review is liked:', error);
      response.status(500).send('An error occurred while checking if the review is liked');
    }
  }


  // eine Review updaten (Text sowie Sterne)
  public async updateReview(request: Request, response: Response): Promise<void> {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      response.status(409).send('User is not logged in');
      return;
    }

    const session = await UserSession.findOne({ where: { sessionId: sessionId } });
    if (!session) {
      response.status(404).send('Session not found');
      return;
    }

    const user = await User.findOne({ where: { userId: session.userId } });
    if (!user) {
      response.status(404).send('User not found');
      return;
    }

    const { reviewId, text, valuation } = request.body;

    try {
      const review = await Review.findOne({ where: { reviewId } });

      if (!review) {
        response.status(404).send('Review not found');
        return;
      }

      if (review.userId !== user.userId) {
        response.status(403).send('Users can only edit their own reviews');
        return;
      }

      review.text = text;
      review.valuation = valuation;
      review.edited = true;  

      await review.save();

      response.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating review:', error);
      response.status(500).send('An error occurred while updating the review');
    }
  }

}
