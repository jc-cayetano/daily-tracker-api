import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User, UserRole } from '../auth/entities/user.entity';

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
  { username: 'admin', password: 'password123', role: UserRole.ADMIN },
  { username: 'john', password: 'password123', role: UserRole.PROJECT_MANAGER },
  { username: 'jane', password: 'password123', role: UserRole.TEAM_MEMBER },
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
          role: user.role,
        }),
      );
      console.log(`Seed user created: ${user.username} (${user.role})`);
    } else if (existing.role !== user.role) {
      existing.role = user.role;
      await userRepository.save(existing);
      console.log(`Seed user updated: ${user.username} → ${user.role}`);
    } else {
      console.log(
        `Seed user already exists: ${user.username} (${user.role}), skipping.`,
      );
    }
  }

  await dataSource.destroy();
}

void seed();
