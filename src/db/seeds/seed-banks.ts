import axios from 'axios';
import { env } from '@config/env';
import BankRepository from '@repositories/banks.repository';

interface FlutterwaveBank {
  id: number;
  code: string;
  name: string;
}

interface FlutterwaveBanksResponse {
  status: string;
  message: string;
  data: FlutterwaveBank[];
}

class BankSeeder {
  private bankRepository: BankRepository;

  constructor() {
    this.bankRepository = new BankRepository();
  }

  async fetchBanksFromFlutterwave(): Promise<FlutterwaveBank[]> {
    try {
      console.log('Fetching banks from Flutterwave API...');
      
      const response = await axios.get<FlutterwaveBanksResponse>(
        'https://api.flutterwave.com/v3/banks/NG',
        {
          headers: {
            'Authorization': `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        console.log(` Successfully fetched ${response.data.data.length} banks`);
        return response.data.data;
      } else {
        throw new Error(`API Error: ${response.data.message}`);
      }
    } catch (error: any) {
      console.error(' Error fetching banks from Flutterwave:', error.message);
      throw error;
    }
  }

  mapFlutterwaveBanksToSchema(flutterwaveBanks: FlutterwaveBank[]) {
    return flutterwaveBanks.map(bank => ({
      bank_name: bank.name,
      bank_code: bank.code
    }));
  }

  async seedBanks(): Promise<void> {
    try {
      console.log('Starting bank seeding process...');

      // Check if banks already exist
      const existingBanks = await this.bankRepository.findAll();
      if (existingBanks.length > 0) {
        console.log(` ${existingBanks.length} banks already exist. Skipping seeding.`);
        console.log(' If you want to re-seed, clear the banks table first.');
        return;
      }

      // Fetch from Flutterwave
      const flutterwaveBanks = await this.fetchBanksFromFlutterwave();

      // Map to our schema
      const banksToInsert = this.mapFlutterwaveBanksToSchema(flutterwaveBanks);

      console.log('💾 Inserting banks into database...');
      
      
      const insertedIds = await this.bankRepository.insertMany(banksToInsert);

      console.log(` Successfully seeded ${insertedIds.length} banks into the database!`);
      
    
    } catch (error: any) {
      console.error(' Error seeding banks:', error.message);
      throw error;
    }
  }

  async clearBanks(): Promise<void> {
    try {
      console.log(' Clearing existing banks...');
      
      console.log('Manual clearing required - truncate banks table if needed');
    } catch (error: any) {
      console.error(' Error clearing banks:', error.message);
      throw error;
    }
  }
}

// Script execution
async function runBankSeeder() {
  const seeder = new BankSeeder();
  
  try {
    await seeder.seedBanks();
    console.log('\n✅ Bank seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Bank seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runBankSeeder();
}

export default BankSeeder;