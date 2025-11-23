import { Request, Response } from 'express';
import { Product } from './models/product';


export class ProductController {
  
  public async getProductById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const product = await Product.findByPk(id);
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).send('Product not found');
      }
    } catch (error) {
      res.status(500).send('Error retrieving product');
    }
  }

  public async getProductByName(req: Request, res: Response): Promise<void> {
    const { name } = req.params;
    try {
      const product = await Product.findOne({ where: { name } });
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).send('Product not found');
      }
    } catch (error) {
      res.status(500).send('Error retrieving product');
    }
  }
}




