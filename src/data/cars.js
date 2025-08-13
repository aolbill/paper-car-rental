export const cars = [
  {
    id: 1,
    name: "Toyota Vitz",
    category: "Economy",
    price: 3500,
    currency: "KSH",
    priceUnit: "per day",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1566473179817-5d3e87501e1d?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop"
    ],
    features: ["Automatic", "5 Seats", "Air Conditioning", "Bluetooth"],
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2020,
    available: true,
    rating: 4.5,
    reviewCount: 127,
    ratingBreakdown: {
      5: 78,
      4: 32,
      3: 12,
      2: 3,
      1: 2
    },
    reviews: [
      {
        id: 1,
        userId: "user123",
        userName: "James Mwangi",
        userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
        rating: 5,
        title: "Excellent city car",
        comment: "Perfect for navigating Nairobi traffic. Very fuel efficient and the AC worked great even in the heat. Would definitely rent again!",
        date: "2024-01-15",
        helpful: 12,
        tripDuration: "3 days",
        verified: true
      },
      {
        id: 2,
        userId: "user456",
        userName: "Sarah Kiprotich",
        userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1ab?w=64&h=64&fit=crop&crop=face",
        rating: 4,
        title: "Good value for money",
        comment: "Clean car with good fuel economy. Perfect for weekend trips around the city. The pickup process was smooth and hassle-free.",
        date: "2024-01-10",
        helpful: 8,
        tripDuration: "2 days",
        verified: true
      },
      {
        id: 3,
        userId: "user789",
        userName: "Peter Ochieng",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
        rating: 5,
        title: "Reliable and comfortable",
        comment: "Used this for business meetings around town. Very reliable and comfortable. The Bluetooth connection worked perfectly for hands-free calls.",
        date: "2024-01-08",
        helpful: 15,
        tripDuration: "5 days",
        verified: true
      }
    ],
    instantBook: true,
    hostName: "KenyaCars Rental",
    hostRating: 4.8,
    hostReviews: 245,
    description: "Perfect for city driving in Nairobi. Fuel efficient and reliable for daily commutes and short trips.",
    pickupLocations: ["Jomo Kenyatta Airport", "Nairobi CBD", "Westlands", "Kisumu", "Eldoret"],
    specifications: {
      engine: "1.3L 4-Cylinder",
      mileage: "18 km/l",
      doors: 5,
      luggage: "2 large bags",
      insurance: "Comprehensive",
      minAge: 21
    }
  },
  {
    id: 2,
    name: "Nissan X-Trail",
    category: "SUV",
    price: 8500,
    currency: "KSH",
    priceUnit: "per day",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517026575980-3e1e2dedeab4?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1562789549-7ba1b06e7c69?w=500&h=300&fit=crop"
    ],
    features: ["AWD", "7 Seats", "Sunroof", "Navigation", "Leather Seats"],
    fuel: "Petrol",
    transmission: "CVT",
    year: 2022,
    available: true,
    rating: 4.8,
    reviewCount: 89,
    ratingBreakdown: {
      5: 65,
      4: 18,
      3: 4,
      2: 1,
      1: 1
    },
    reviews: [
      {
        id: 4,
        userId: "user234",
        userName: "Mary Wanjiku",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
        rating: 5,
        title: "Perfect for safari!",
        comment: "Amazing vehicle for our Maasai Mara trip. The AWD handled rough roads perfectly and there was plenty of space for our family of 6. Highly recommend!",
        date: "2024-01-20",
        helpful: 23,
        tripDuration: "7 days",
        verified: true
      },
      {
        id: 5,
        userId: "user567",
        userName: "David Kimani",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
        rating: 5,
        title: "Excellent family car",
        comment: "Spacious and comfortable for our road trip to Mombasa. The navigation system was very helpful and fuel consumption was reasonable.",
        date: "2024-01-18",
        helpful: 19,
        tripDuration: "4 days",
        verified: true
      }
    ],
    instantBook: true,
    hostName: "Safari Adventures Kenya",
    hostRating: 4.9,
    hostReviews: 156,
    description: "Ideal for safari trips and family adventures across Kenya. Perfect for Maasai Mara and Amboseli expeditions.",
    pickupLocations: ["Wilson Airport", "Nairobi CBD", "Karen", "Gigiri", "Mombasa", "Nakuru"],
    specifications: {
      engine: "2.5L 4-Cylinder",
      mileage: "12 km/l",
      doors: 5,
      luggage: "4 large bags",
      insurance: "Comprehensive + Safari Coverage",
      minAge: 25
    }
  },
  {
    id: 3,
    name: "Toyota Hilux",
    category: "Pickup",
    price: 12000,
    currency: "KSH",
    priceUnit: "per day",
    image: "https://images.unsplash.com/photo-1562349831-cf5ea95b3a31?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1562349831-cf5ea95b3a31?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551830820-330a71b99659?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=500&h=300&fit=crop"
    ],
    features: ["4WD", "Double Cab", "Towing Capacity", "Off-road Ready"],
    fuel: "Diesel",
    transmission: "Manual",
    year: 2021,
    available: true,
    rating: 4.7,
    reviewCount: 156,
    ratingBreakdown: {
      5: 89,
      4: 45,
      3: 15,
      2: 5,
      1: 2
    },
    reviews: [
      {
        id: 6,
        userId: "user345",
        userName: "John Kariuki",
        userAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&crop=face",
        rating: 5,
        title: "Tough and reliable",
        comment: "Used this for construction work in Kiambu. Handled heavy loads and rough terrain with ease. Excellent fuel efficiency for a pickup.",
        date: "2024-01-22",
        helpful: 31,
        tripDuration: "10 days",
        verified: true
      },
      {
        id: 7,
        userId: "user678",
        userName: "Grace Mutua",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
        rating: 4,
        title: "Great for adventure trips",
        comment: "Perfect for our camping trip to Mount Kenya. The 4WD was essential on mountain roads. Spacious cab for gear.",
        date: "2024-01-19",
        helpful: 18,
        tripDuration: "5 days",
        verified: true
      }
    ],
    instantBook: false,
    hostName: "WorkTruck Rentals",
    hostRating: 4.6,
    hostReviews: 98,
    description: "Perfect for construction work and off-road adventures. Built for Kenya's tough terrain.",
    pickupLocations: ["Industrial Area", "Mombasa Road", "Thika Road", "Machakos", "Nyeri"],
    specifications: {
      engine: "2.4L Turbo Diesel",
      mileage: "10 km/l",
      doors: 4,
      luggage: "Open bed + 2 bags",
      insurance: "Commercial Coverage",
      minAge: 25
    }
  },
  {
    id: 4,
    name: "Mercedes C-Class",
    category: "Luxury",
    price: 15000,
    currency: "KSH",
    priceUnit: "per day",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop"
    ],
    features: ["Leather Interior", "Premium Sound", "Climate Control", "Sport Mode"],
    fuel: "Petrol",
    transmission: "Automatic",
    year: 2023,
    available: false,
    rating: 4.9,
    reviewCount: 45,
    ratingBreakdown: {
      5: 41,
      4: 3,
      3: 1,
      2: 0,
      1: 0
    },
    reviews: [
      {
        id: 8,
        userId: "user456",
        userName: "Robert Njoroge",
        userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
        rating: 5,
        title: "Luxury at its finest",
        comment: "Exceptional vehicle for business meetings. The interior is immaculate and the ride quality is superb. Perfect for impressing clients.",
        date: "2024-01-25",
        helpful: 27,
        tripDuration: "3 days",
        verified: true
      },
      {
        id: 9,
        userId: "user789",
        userName: "Linda Achieng",
        userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face",
        rating: 5,
        title: "Special occasion perfect",
        comment: "Used this for my wedding day. Absolutely perfect! The driver service was professional and the car was spotless.",
        date: "2024-01-20",
        helpful: 35,
        tripDuration: "1 day",
        verified: true
      }
    ],
    instantBook: false,
    hostName: "Luxury Motors Kenya",
    hostRating: 4.9,
    hostReviews: 67,
    description: "Luxury comfort for business meetings and special occasions. Executive class transportation.",
    pickupLocations: ["Jomo Kenyatta Airport", "Serena Hotel", "Villa Rosa Kempinski", "Mombasa", "Kisumu"],
    specifications: {
      engine: "2.0L Turbo",
      mileage: "14 km/l",
      doors: 4,
      luggage: "3 large bags",
      insurance: "Premium Coverage",
      minAge: 25
    }
  },
  {
    id: 5,
    name: "Honda Freed",
    category: "Van",
    price: 6500,
    currency: "KSH",
    priceUnit: "per day",
    image: "https://images.unsplash.com/photo-1506764543633-6b5f8f82c78a?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1506764543633-6b5f8f82c78a?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop"
    ],
    features: ["8 Seats", "Sliding Doors", "Family Friendly", "Spacious"],
    fuel: "Hybrid",
    transmission: "CVT",
    year: 2019,
    available: true,
    rating: 4.4,
    reviewCount: 78,
    ratingBreakdown: {
      5: 42,
      4: 24,
      3: 8,
      2: 3,
      1: 1
    },
    reviews: [
      {
        id: 10,
        userId: "user567",
        userName: "Catherine Wanjiru",
        userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=face",
        rating: 4,
        title: "Great for families",
        comment: "Perfect for our family of 7. The sliding doors made it easy for kids to get in and out. Good fuel economy for a van.",
        date: "2024-01-17",
        helpful: 16,
        tripDuration: "6 days",
        verified: true
      },
      {
        id: 11,
        userId: "user890",
        userName: "Michael Otieno",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
        rating: 5,
        title: "Comfortable group travel",
        comment: "Used this for a church retreat to Nakuru. Everyone was comfortable and we had plenty of space for luggage. Hybrid engine saved on fuel costs.",
        date: "2024-01-14",
        helpful: 22,
        tripDuration: "3 days",
        verified: true
      }
    ],
    instantBook: true,
    hostName: "Family Rentals Kenya",
    hostRating: 4.7,
    hostReviews: 134,
    description: "Perfect for family trips and group transportation. Ideal for large families visiting Kenya.",
    pickupLocations: ["Nairobi CBD", "Westlands", "Kasarani", "Mombasa", "Nakuru"],
    specifications: {
      engine: "1.5L Hybrid",
      mileage: "20 km/l",
      doors: 5,
      luggage: "5 large bags",
      insurance: "Family Coverage",
      minAge: 23
    }
  },
  {
    id: 6,
    name: "Subaru Forester",
    category: "SUV",
    price: 9500,
    currency: "KSH",
    priceUnit: "per day",
    image: "https://images.unsplash.com/photo-1549399505-7e1bfbdc858a?w=500&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1549399505-7e1bfbdc858a?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop"
    ],
    features: ["AWD", "Safety Features", "Roof Rails", "Ground Clearance"],
    fuel: "Petrol",
    transmission: "CVT",
    year: 2021,
    available: true,
    rating: 4.6,
    reviewCount: 92,
    ratingBreakdown: {
      5: 54,
      4: 28,
      3: 7,
      2: 2,
      1: 1
    },
    reviews: [
      {
        id: 12,
        userId: "user123",
        userName: "Paul Maina",
        userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face",
        rating: 5,
        title: "All-weather champion",
        comment: "Drove this from Nairobi to Mombasa during rainy season. The AWD system handled everything perfectly. Very comfortable ride.",
        date: "2024-01-23",
        helpful: 29,
        tripDuration: "4 days",
        verified: true
      },
      {
        id: 13,
        userId: "user234",
        userName: "Joyce Nyambura",
        userAvatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=64&h=64&fit=crop&crop=face",
        rating: 4,
        title: "Safe and reliable",
        comment: "Great safety features gave me confidence driving with my family. The ground clearance was helpful on rural roads in Meru.",
        date: "2024-01-16",
        helpful: 14,
        tripDuration: "5 days",
        verified: true
      }
    ],
    instantBook: true,
    hostName: "Adventure Drives Kenya",
    hostRating: 4.8,
    hostReviews: 178,
    description: "Reliable AWD for all weather conditions in Kenya. Excellent for highlands and coastal drives.",
    pickupLocations: ["JKIA", "Nairobi CBD", "Upper Hill", "Kiambu Road", "Meru", "Eldoret"],
    specifications: {
      engine: "2.5L Boxer",
      mileage: "13 km/l",
      doors: 5,
      luggage: "4 large bags",
      insurance: "All-terrain Coverage",
      minAge: 23
    }
  }
];

export const categories = [
  { id: "all", name: "All Cars", count: cars.length },
  { id: "economy", name: "Economy", count: cars.filter(car => car.category === "Economy").length },
  { id: "suv", name: "SUV", count: cars.filter(car => car.category === "SUV").length },
  { id: "luxury", name: "Luxury", count: cars.filter(car => car.category === "Luxury").length },
  { id: "pickup", name: "Pickup", count: cars.filter(car => car.category === "Pickup").length },
  { id: "van", name: "Van", count: cars.filter(car => car.category === "Van").length }
];

// Comprehensive Kenyan locations organized by regions
export const kenyanLocations = {
  nairobi: {
    name: "Nairobi County",
    locations: [
      "Jomo Kenyatta International Airport (JKIA)",
      "Wilson Airport",
      "Nairobi CBD",
      "Westlands",
      "Karen",
      "Gigiri",
      "Upper Hill",
      "Kilimani",
      "Lavington",
      "Parklands",
      "Eastleigh",
      "South B",
      "South C",
      "Industrial Area",
      "Kasarani",
      "Embakasi",
      "Langata",
      "Runda",
      "Muthaiga"
    ]
  },
  central: {
    name: "Central Kenya",
    locations: [
      "Thika",
      "Kiambu",
      "Nyeri",
      "Nanyuki",
      "Meru",
      "Embu",
      "Murang'a",
      "Kirinyaga",
      "Machakos",
      "Kitui"
    ]
  },
  coast: {
    name: "Coastal Region",
    locations: [
      "Moi International Airport Mombasa",
      "Mombasa CBD",
      "Diani Beach",
      "Malindi",
      "Watamu",
      "Lamu",
      "Kilifi",
      "Mtwapa",
      "Ukunda",
      "Voi"
    ]
  },
  western: {
    name: "Western Kenya",
    locations: [
      "Kisumu",
      "Eldoret",
      "Kakamega",
      "Bungoma",
      "Kitale",
      "Busia",
      "Webuye",
      "Mumias",
      "Vihiga"
    ]
  },
  riftValley: {
    name: "Rift Valley",
    locations: [
      "Nakuru",
      "Naivasha",
      "Kericho",
      "Bomet",
      "Narok",
      "Kajiado",
      "Maasai Mara",
      "Lake Bogoria",
      "Thomson's Falls",
      "Iten"
    ]
  },
  northern: {
    name: "Northern Kenya",
    locations: [
      "Isiolo",
      "Marsabit",
      "Moyale",
      "Lodwar",
      "Maralal",
      "Samburu"
    ]
  },
  eastern: {
    name: "Eastern Kenya",
    locations: [
      "Garissa",
      "Wajir",
      "Mandera",
      "Isiolo",
      "Mwingi"
    ]
  }
};

// Flattened list of all locations for dropdowns
export const locations = Object.values(kenyanLocations)
  .flatMap(region => region.locations)
  .sort();

// Popular tourist destinations in Kenya
export const touristDestinations = [
  {
    name: "Maasai Mara National Reserve",
    region: "Rift Valley",
    type: "Safari",
    recommendedCars: ["Nissan X-Trail", "Subaru Forester", "Toyota Hilux"]
  },
  {
    name: "Amboseli National Park",
    region: "Eastern",
    type: "Safari",
    recommendedCars: ["Nissan X-Trail", "Subaru Forester"]
  },
  {
    name: "Diani Beach",
    region: "Coast",
    type: "Beach",
    recommendedCars: ["Toyota Vitz", "Honda Freed", "Mercedes C-Class"]
  },
  {
    name: "Mount Kenya",
    region: "Central",
    type: "Adventure",
    recommendedCars: ["Subaru Forester", "Toyota Hilux"]
  },
  {
    name: "Lake Nakuru",
    region: "Rift Valley",
    type: "Wildlife",
    recommendedCars: ["Nissan X-Trail", "Subaru Forester"]
  },
  {
    name: "Tsavo National Parks",
    region: "Eastern",
    type: "Safari",
    recommendedCars: ["Nissan X-Trail", "Toyota Hilux"]
  }
];
