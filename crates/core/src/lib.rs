pub const PROJECT_NAME: &str = "Biljarditutka";

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct TablePoint {
    pub x: f32,
    pub y: f32,
}

impl TablePoint {
    pub fn normalized(x: f32, y: f32) -> Option<Self> {
        let point = Self { x, y };
        point.is_normalized().then_some(point)
    }

    pub fn is_normalized(self) -> bool {
        (0.0..=1.0).contains(&self.x) && (0.0..=1.0).contains(&self.y)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BallId {
    Cue,
    Object(u8),
}

impl BallId {
    pub fn object(number: u8) -> Option<Self> {
        (1..=15).contains(&number).then_some(Self::Object(number))
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct TrackedBall {
    pub id: BallId,
    pub position: TablePoint,
    pub confidence: f32,
}

impl TrackedBall {
    pub fn new(id: BallId, position: TablePoint, confidence: f32) -> Option<Self> {
        if !(0.0..=1.0).contains(&confidence) {
            return None;
        }

        Some(Self {
            id,
            position,
            confidence,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalized_table_points_reject_outside_coordinates() {
        assert!(TablePoint::normalized(0.5, 0.5).is_some());
        assert!(TablePoint::normalized(-0.01, 0.5).is_none());
        assert!(TablePoint::normalized(0.5, 1.01).is_none());
    }

    #[test]
    fn pool_object_ball_numbers_are_one_through_fifteen() {
        assert_eq!(BallId::object(1), Some(BallId::Object(1)));
        assert_eq!(BallId::object(15), Some(BallId::Object(15)));
        assert_eq!(BallId::object(0), None);
        assert_eq!(BallId::object(16), None);
    }

    #[test]
    fn confidence_is_normalized() {
        let Some(position) = TablePoint::normalized(0.2, 0.8) else {
            panic!("test point should be valid");
        };
        assert!(TrackedBall::new(BallId::Cue, position, 0.95).is_some());
        assert!(TrackedBall::new(BallId::Cue, position, 1.1).is_none());
    }
}
