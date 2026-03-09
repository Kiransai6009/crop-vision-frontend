import { useState } from "react";
import { motion } from "framer-motion";
import {
  Satellite, CloudRain, Thermometer, Droplets, TrendingUp,
  Wheat, MapPin, ArrowLeft, BarChart3, Leaf, Layers, Microscope, IndianRupee
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const ndviData = [
  { month: "Jan", ndvi: 0.21 },
  { month: "Feb", ndvi: 0.28 },
  { month: "Mar", ndvi: 0.45 },
  { month: "Apr", ndvi: 0.62 },
  { month: "May", ndvi: 0.78 },
  { month: "Jun", ndvi: 0.85 },
  { month: "Jul", ndvi: 0.82 },
  { month: "Aug", ndvi: 0.73 },
  { month: "Sep", ndvi: 0.58 },
  { month: "Oct", ndvi: 0.39 },
  { month: "Nov", ndvi: 0.27 },
  { month: "Dec", ndvi: 0.22 },
];

const yieldData = [
  { year: "2019", actual: 3.2, predicted: 3.1 },
  { year: "2020", actual: 3.8, predicted: 3.7 },
  { year: "2021", actual: 2.9, predicted: 3.0 },
  { year: "2022", actual: 4.1, predicted: 4.0 },
  { year: "2023", actual: 4.5, predicted: 4.4 },
  { year: "2024", actual: 4.2, predicted: 4.3 },
  { year: "2025", actual: null, predicted: 4.7 },
];

const weatherData = [
  { month: "Jan", rainfall: 12, temp: 18 },
  { month: "Feb", rainfall: 15, temp: 21 },
  { month: "Mar", rainfall: 42, temp: 26 },
  { month: "Apr", rainfall: 68, temp: 31 },
  { month: "May", rainfall: 95, temp: 34 },
  { month: "Jun", rainfall: 180, temp: 33 },
  { month: "Jul", rainfall: 220, temp: 30 },
  { month: "Aug", rainfall: 195, temp: 29 },
  { month: "Sep", rainfall: 140, temp: 28 },
  { month: "Oct", rainfall: 60, temp: 27 },
  { month: "Nov", rainfall: 18, temp: 22 },
  { month: "Dec", rainfall: 8, temp: 18 },
];

const crops = [
  "Rice", "Wheat", "Maize", "Soybean", "Cotton", "Sugarcane", "Jowar (Sorghum)",
  "Bajra (Pearl Millet)", "Ragi (Finger Millet)", "Barley", "Groundnut", "Sunflower",
  "Mustard", "Sesame", "Linseed", "Chickpea (Gram)", "Pigeon Pea (Tur)", "Moong (Green Gram)",
  "Urad (Black Gram)", "Lentil (Masoor)", "Jute", "Tea", "Coffee", "Rubber", "Coconut",
  "Arecanut", "Cashew", "Tobacco", "Turmeric", "Ginger", "Chilli", "Onion", "Potato",
  "Tomato", "Banana", "Mango", "Grapes", "Apple", "Orange", "Papaya",
];

const stateDistricts: Record<string, string[]> = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Anjaw", "Changlang", "East Kameng", "East Siang", "Lohit", "Lower Dibang Valley", "Papum Pare", "Tawang", "Tirap", "Upper Siang", "West Kameng", "West Siang"],
  "Assam": ["Barpeta", "Cachar", "Darrang", "Dhubri", "Dibrugarh", "Goalpara", "Jorhat", "Kamrup", "Karbi Anglong", "Lakhimpur", "Nagaon", "Sivasagar", "Sonitpur", "Tinsukia"],
  "Bihar": ["Araria", "Begusarai", "Bhagalpur", "Bhojpur", "Darbhanga", "Gaya", "Gopalganj", "Muzaffarpur", "Nalanda", "Patna", "Purnia", "Samastipur", "Saran", "Vaishali"],
  "Chhattisgarh": ["Bastar", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Janjgir-Champa", "Jashpur", "Korba", "Koriya", "Mahasamund", "Raigarh", "Raipur", "Rajnandgaon", "Surguja"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Banaskantha", "Bharuch", "Bhavnagar", "Gandhinagar", "Jamnagar", "Junagadh", "Kutch", "Mehsana", "Narmada", "Navsari", "Patan", "Rajkot", "Sabarkantha", "Surat", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul & Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Lohardaga", "Palamu", "Ranchi", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Bangalore Rural", "Bangalore Urban", "Belgaum", "Bellary", "Bidar", "Bijapur", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kolar", "Mandya", "Mysore", "Raichur", "Shimoga", "Tumkur", "Udupi", "Uttara Kannada"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Madhya Pradesh": ["Balaghat", "Betul", "Bhind", "Bhopal", "Chhindwara", "Damoh", "Dewas", "Dhar", "Guna", "Gwalior", "Hoshangabad", "Indore", "Jabalpur", "Katni", "Mandla", "Morena", "Narsinghpur", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shajapur", "Ujjain", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Senapati", "Tamenglong", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri-Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "SBS Nagar", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "Theni", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tuticorin", "Vellore", "Villupuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Hyderabad", "Karimnagar", "Khammam", "Mahabubnagar", "Medak", "Nalgonda", "Nizamabad", "Rangareddy", "Warangal"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Banda", "Barabanki", "Bareilly", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hardoi", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Lakhimpur Kheri", "Lucknow", "Mathura", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pratapgarh", "Rae Bareli", "Rampur", "Saharanpur", "Shahjahanpur", "Sitapur", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Bankura", "Birbhum", "Burdwan", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Medinipur", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
  "Andaman & Nicobar Islands": ["Nicobar", "North & Middle Andaman", "South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra & Nagar Haveli and Daman & Diu": ["Dadra & Nagar Haveli", "Daman", "Diu"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Jammu & Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
};

const states = Object.keys(stateDistricts);

const StatCard = ({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-5 rounded-xl bg-card border border-border shadow-card"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </div>
    <div className="font-display font-bold text-2xl text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </motion.div>
);

const Dashboard = () => {
  const [selectedCrop, setSelectedCrop] = useState("Rice");
  const [selectedState, setSelectedState] = useState("Maharashtra");
  const [selectedDistrict, setSelectedDistrict] = useState(stateDistricts["Maharashtra"][0]);

  const districts = stateDistricts[selectedState] || [];

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict(stateDistricts[state]?.[0] || "");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          {/* Top row: logo + nav */}
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Satellite className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-foreground">Crop Insight</span>
              </div>
            </div>
            {/* Desktop and Tablet filters */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/modules" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-all active:scale-95">
                <Layers className="w-3.5 h-3.5" /> Modules
              </Link>
              <div className="h-6 w-px bg-border mx-1" />
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer hover:bg-muted/80 transition-colors"
              >
                {crops.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer hover:bg-muted/80 transition-colors"
              >
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer hover:bg-muted/80 transition-colors"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Mobile All Modules link */}
            <div className="md:hidden">
              <Link to="/modules" className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Layers className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Mobile filters (compact) */}
          <div className="md:hidden flex flex-col gap-2 pb-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="px-3 py-2 rounded-lg bg-muted text-foreground text-xs border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {crops.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="px-3 py-2 rounded-lg bg-muted text-foreground text-xs border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-muted text-foreground text-xs border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {selectedCrop} Yield Prediction — {selectedDistrict}, {selectedState}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Satellite-powered analysis with NDVI, weather integration, and ML predictions
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Wheat}
            label="Predicted Yield"
            value="4.7 t/ha"
            sub="2025"
            color="bg-primary/10 text-primary"
          />
          <StatCard
            icon={Leaf}
            label="Current NDVI"
            value="0.78"
            sub="Healthy"
            color="bg-chart-4/10 text-chart-4"
          />
          <StatCard
            icon={Thermometer}
            label="Avg Temperature"
            value="28°C"
            sub="This month"
            color="bg-secondary/10 text-secondary"
          />
          <StatCard
            icon={Droplets}
            label="Total Rainfall"
            value="982mm"
            sub="This season"
            color="bg-accent/10 text-accent"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* NDVI Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl bg-card border border-border shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground">NDVI Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={ndviData}>
                <defs>
                  <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(145, 63%, 32%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(145, 63%, 32%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 12%, 88%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(160, 10%, 40%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(160, 10%, 40%)" domain={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(150, 12%, 88%)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ndvi"
                  stroke="hsl(145, 63%, 32%)"
                  strokeWidth={2}
                  fill="url(#ndviGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Yield Prediction Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-card border border-border shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-secondary" />
              <h3 className="font-display font-semibold text-foreground">Yield: Actual vs Predicted</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 12%, 88%)" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="hsl(160, 10%, 40%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(160, 10%, 40%)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(150, 12%, 88%)",
                    borderRadius: "0.5rem",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(145, 63%, 32%)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(145, 63%, 32%)" }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(38, 92%, 50%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: "hsl(38, 92%, 50%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-3 justify-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 bg-primary rounded" /> Actual
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-0.5 bg-secondary rounded border-dashed" style={{ borderTop: "2px dashed hsl(38, 92%, 50%)", height: 0 }} /> Predicted
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weather Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-xl bg-card border border-border shadow-card mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <CloudRain className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-foreground">Weather Summary</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 12%, 88%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(160, 10%, 40%)" />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="hsl(160, 10%, 40%)" label={{ value: "Rainfall (mm)", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "hsl(160, 10%, 40%)" } }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="hsl(160, 10%, 40%)" label={{ value: "Temp (°C)", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "hsl(160, 10%, 40%)" } }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(150, 12%, 88%)",
                  borderRadius: "0.5rem",
                  fontSize: 12,
                }}
              />
              <Bar yAxisId="left" dataKey="rainfall" fill="hsl(200, 80%, 40%)" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Line yAxisId="right" type="monotone" dataKey="temp" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(38, 92%, 50%)" }} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Model Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          <div className="p-5 rounded-xl bg-card border border-border shadow-card">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Model</h4>
            <p className="font-display font-bold text-foreground">Random Forest + CNN</p>
            <p className="text-xs text-muted-foreground mt-1">Fusion architecture with satellite + weather branches</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-medium text-muted-foreground">RMSE</h4>
            </div>
            <p className="font-display font-bold text-2xl text-foreground">0.187</p>
            <p className="text-xs text-primary mt-1">↓ 12% improvement over baseline</p>
          </div>
          <div className="p-5 rounded-xl bg-card border border-border shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-secondary" />
              <h4 className="text-sm font-medium text-muted-foreground">MAE</h4>
            </div>
            <p className="font-display font-bold text-2xl text-foreground">0.142</p>
            <p className="text-xs text-secondary mt-1">Across 120+ districts</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
