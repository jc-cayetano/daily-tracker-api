import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../auth/entities/user.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: true,
});

const users = [
  { username: 'admin', password: 'password123' },
  { username: 'john', password: 'password123' },
  { username: 'jane', password: 'password123' },
];

async function seed() {
  await dataSource.initialize();
  const userRepository = dataSource.getRepository(User);

  for (const user of users) {
    const existing = await userRepository.findOne({
      where: { username: user.username },
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await userRepository.save(
        userRepository.create({
          username: user.username,
          password: hashedPassword,
        }),
      );
      console.log(`Seed user created: ${user.username} / ${user.password}`);
    } else {
      console.log(`Seed user already exists: ${user.username}, skipping.`);
    }
  }

  await dataSource.destroy();
}

void seed();
