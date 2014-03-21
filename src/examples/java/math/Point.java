package math;

class Point {
   static Point origin = new Point(0,0); 
   int x, y; 
     // This always refers to an object at (0,0) 

   public static Point getOrigin() {
	   return origin;
   }
   public static Point add(int x, y) {
	   
   }
   
   Point(double x_value, double y_value) {
      x = x_value; 
      y = y_value; 
   }
   
   public void clear() {
      this.x = 0; 
      this.y = 0; 
   }
   
   public double distance(Point that) {
      double xDiff = x - that.x; 
      double yDiff = y - that.y; 
      return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
   }
}

