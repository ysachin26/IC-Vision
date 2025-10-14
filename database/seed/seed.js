const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Sample data for seeding the database
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@marksure.com',
    password: 'admin123',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    department: 'IT',
    isActive: true
  },
  {
    username: 'operator1',
    email: 'operator1@marksure.com',
    password: 'operator123',
    firstName: 'John',
    lastName: 'Smith',
    role: 'operator',
    department: 'Quality Assurance',
    isActive: true
  },
  {
    username: 'operator2',
    email: 'operator2@marksure.com',
    password: 'operator123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'operator',
    department: 'Manufacturing',
    isActive: true
  }
];

const sampleOemMarkings = [
  {
    icPartNumber: 'ATMEGA328P-PU',
    manufacturer: 'Microchip Technology',
    series: 'ATmega',
    packageType: 'DIP',
    category: 'microcontroller',
    marking: {
      text: 'ATMEGA328P-PU\n2241\nAVR',
      format: 'alphanumeric',
      lines: 3,
      font: 'laser_etched',
      size: 'small'
    },
    logo: {
      hasLogo: true,
      logoName: 'Microchip',
      logoPosition: 'top'
    },
    dimensions: {
      length: 35.56,
      width: 15.24,
      height: 4.83
    },
    variations: [
      {
        pattern: 'ATMEGA328P-PU\\n[0-9]{4}\\nAVR',
        description: 'Standard marking with date code',
        regex: '^ATMEGA328P-PU\\s+[0-9]{4}\\s+AVR$',
        examples: ['ATMEGA328P-PU 2241 AVR', 'ATMEGA328P-PU 2133 AVR']
      }
    ],
    validationRules: {
      minSimilarity: 0.85,
      requiredElements: ['ATMEGA328P-PU', 'AVR'],
      forbiddenElements: ['CHINA', 'COPY'],
      caseSensitive: false
    },
    datasheet: {
      url: 'https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf',
      version: '1.3'
    },
    source: 'manual_entry',
    confidence: 1.0,
    notes: 'Popular Arduino-compatible microcontroller',
    tags: ['arduino', 'microcontroller', '8-bit', 'avr']
  },
  {
    icPartNumber: 'STM32F103C8T6',
    manufacturer: 'STMicroelectronics',
    series: 'STM32F1',
    packageType: 'LQFP',
    category: 'microcontroller',
    marking: {
      text: 'STM32F103C8T6\n945\nCHN 517',
      format: 'alphanumeric',
      lines: 3,
      font: 'laser_etched',
      size: 'very_small'
    },
    logo: {
      hasLogo: true,
      logoName: 'ST',
      logoPosition: 'top'
    },
    dimensions: {
      length: 10.0,
      width: 10.0,
      height: 1.6
    },
    variations: [
      {
        pattern: 'STM32F103C8T6\\n[0-9]{3}\\n[A-Z]{3} [0-9]{3}',
        description: 'Standard marking with date and lot codes',
        regex: '^STM32F103C8T6\\s+[0-9]{3}\\s+[A-Z]{3}\\s+[0-9]{3}$',
        examples: ['STM32F103C8T6 945 CHN 517', 'STM32F103C8T6 834 USA 401']
      }
    ],
    validationRules: {
      minSimilarity: 0.90,
      requiredElements: ['STM32F103C8T6'],
      forbiddenElements: ['FAKE', 'COPY', 'CS32F103'],
      caseSensitive: false
    },
    datasheet: {
      url: 'https://www.st.com/resource/en/datasheet/stm32f103c8.pdf',
      version: '19'
    },
    source: 'manual_entry',
    confidence: 1.0,
    notes: 'Popular ARM Cortex-M3 microcontroller, often counterfeited',
    tags: ['stm32', 'arm', 'cortex-m3', '32-bit', 'blue-pill']
  },
  {
    icPartNumber: 'NE555P',
    manufacturer: 'Texas Instruments',
    series: '555',
    packageType: 'DIP',
    category: 'analog',
    marking: {
      text: 'NE555P\nTI 2241',
      format: 'alphanumeric',
      lines: 2,
      font: 'laser_etched',
      size: 'medium'
    },
    logo: {
      hasLogo: true,
      logoName: 'TI',
      logoPosition: 'top'
    },
    dimensions: {
      length: 9.78,
      width: 6.35,
      height: 4.83
    },
    variations: [
      {
        pattern: 'NE555P\\nTI [0-9]{4}',
        description: 'TI marking with date code',
        regex: '^NE555P\\s+TI\\s+[0-9]{4}$',
        examples: ['NE555P TI 2241', 'NE555P TI 2133']
      },
      {
        pattern: '555\\n[0-9]{4}',
        description: 'Simplified marking variant',
        regex: '^555\\s+[0-9]{4}$',
        examples: ['555 2241', '555 2133']
      }
    ],
    validationRules: {
      minSimilarity: 0.80,
      requiredElements: ['555'],
      forbiddenElements: ['CHINA COPY'],
      caseSensitive: false
    },
    datasheet: {
      url: 'https://www.ti.com/lit/ds/symlink/ne555.pdf',
      version: 'SLOS953I'
    },
    source: 'manual_entry',
    confidence: 1.0,
    notes: 'Classic timer IC, many legitimate manufacturers',
    tags: ['timer', '555', 'analog', 'classic']
  },
  {
    icPartNumber: 'ESP32-WROOM-32',
    manufacturer: 'Espressif Systems',
    series: 'ESP32',
    packageType: 'OTHER',
    category: 'microcontroller',
    marking: {
      text: 'ESP32-WROOM-32\nFCC ID: 2AC7Z-ESP32WROOM32',
      format: 'mixed',
      lines: 2,
      font: 'screen_printed',
      size: 'small'
    },
    logo: {
      hasLogo: false
    },
    dimensions: {
      length: 25.5,
      width: 18.0,
      height: 3.1
    },
    variations: [
      {
        pattern: 'ESP32-WROOM-32\\nFCC ID: 2AC7Z-ESP32WROOM32',
        description: 'Standard module marking with FCC ID',
        regex: '^ESP32-WROOM-32\\s+FCC\\s+ID:\\s+2AC7Z-ESP32WROOM32$',
        examples: ['ESP32-WROOM-32 FCC ID: 2AC7Z-ESP32WROOM32']
      }
    ],
    validationRules: {
      minSimilarity: 0.90,
      requiredElements: ['ESP32-WROOM-32', 'FCC ID'],
      forbiddenElements: ['ESP8266', 'CLONE'],
      caseSensitive: false
    },
    datasheet: {
      url: 'https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32_datasheet_en.pdf',
      version: '3.9'
    },
    source: 'manual_entry',
    confidence: 1.0,
    notes: 'Popular WiFi/Bluetooth module, check FCC ID authenticity',
    tags: ['esp32', 'wifi', 'bluetooth', 'module', 'iot']
  },
  {
    icPartNumber: 'LM358P',
    manufacturer: 'Texas Instruments',
    series: 'LM358',
    packageType: 'DIP',
    category: 'analog',
    marking: {
      text: 'LM358P\\nTI\\n2241',
      format: 'alphanumeric',
      lines: 3,
      font: 'laser_etched',
      size: 'medium'
    },
    logo: {
      hasLogo: true,
      logoName: 'TI',
      logoPosition: 'center'
    },
    dimensions: {
      length: 9.78,
      width: 6.35,
      height: 4.83
    },
    variations: [
      {
        pattern: 'LM358[PN]?\\n[A-Z]{2}\\n[0-9]{4}',
        description: 'Various manufacturers with date codes',
        regex: '^LM358[PN]?\\s+[A-Z]{2,3}\\s+[0-9]{4}$',
        examples: ['LM358P TI 2241', 'LM358N ST 2133', 'LM358 ON 2240']
      }
    ],
    validationRules: {
      minSimilarity: 0.75,
      requiredElements: ['LM358'],
      forbiddenElements: ['COPY'],
      caseSensitive: false
    },
    datasheet: {
      url: 'https://www.ti.com/lit/ds/symlink/lm358.pdf',
      version: 'SLOS068N'
    },
    source: 'manual_entry',
    confidence: 0.9,
    notes: 'Common op-amp, multiple legitimate manufacturers exist',
    tags: ['opamp', 'analog', 'dual', 'amplifier']
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/marksure';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - uncomment if you want to reset)
    // await mongoose.connection.db.dropDatabase();
    // console.log('Database cleared');

    // Get models
    const User = require('../../backend/src/models/User');
    const OemMarking = require('../../backend/src/models/OemMarking');

    // Seed users
    console.log('Seeding users...');
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ 
        $or: [{ email: userData.email }, { username: userData.username }] 
      });
      
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.username}`);
      } else {
        console.log(`User already exists: ${userData.username}`);
      }
    }

    // Get admin user for OEM markings
    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Seed OEM markings
    console.log('Seeding OEM markings...');
    for (const oemData of sampleOemMarkings) {
      const existingOem = await OemMarking.findOne({
        manufacturer: oemData.manufacturer,
        icPartNumber: oemData.icPartNumber
      });

      if (!existingOem) {
        const oemMarking = new OemMarking({
          ...oemData,
          createdBy: adminUser._id
        });
        await oemMarking.save();
        console.log(`Created OEM marking: ${oemData.manufacturer} ${oemData.icPartNumber}`);
      } else {
        console.log(`OEM marking already exists: ${oemData.manufacturer} ${oemData.icPartNumber}`);
      }
    }

    console.log('Database seeding completed successfully!');
    
    // Display summary
    const userCount = await User.countDocuments();
    const oemCount = await OemMarking.countDocuments();
    
    console.log(`\\n📊 Database Summary:`);
    console.log(`👥 Users: ${userCount}`);
    console.log(`🔧 OEM Markings: ${oemCount}`);
    console.log(`\\n🎉 Ready to start the application!`);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleUsers, sampleOemMarkings };