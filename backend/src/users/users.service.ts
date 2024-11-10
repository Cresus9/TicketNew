// src/users/users.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { UserDto } from './dto/users.dto';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new user.
   * @param data - The data required to create a user.
   * @returns The created user without sensitive fields.
   */
  async create(data: CreateUserDto): Promise<UserDto> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role || Role.USER
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        isOnline: true,
        _count: {
          select: {
            orders: true,
            notifications: true
          }
        }
      }
    });

    return user;
  }

  /**
   * Retrieves all users based on provided parameters.
   * @param params - The parameters for pagination, filtering, and sorting.
   * @returns An array of users without sensitive fields.
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<UserDto[]> { // Change return type to UserDto[]
    const { skip, take, where, orderBy } = params;
    const users = await this.prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        isOnline: true,
        _count: {
          select: {
            orders: true,
            notifications: true
          }
        }
      }
    });

    return users;
  }

  /**
   * Retrieves a single user by ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user without sensitive fields.
   */
  async findOne(id: string): Promise<UserDto> { // Change return type to UserDto
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        isOnline: true,
        _count: {
          select: {
            orders: true,
            notifications: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Finds a user by email.
   * @param email - The email of the user to find.
   * @returns The user with all fields or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    // Depending on usage, you might want to return UserDto or exclude password
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Updates a user's information.
   * @param id - The ID of the user to update.
   * @param data - The data to update.
   * @returns The updated user without sensitive fields.
   */
  async update(id: string, data: UpdateUserDto): Promise<UserDto> { // Change return type to UserDto
    // If updating email, check if it's already taken
    if (data.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id }
        }
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    // If updating password, hash it
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          lastLogin: true,
          isOnline: true,
          _count: {
            select: {
              orders: true,
              notifications: true
            }
          }
        }
      });
      return updatedUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  /**
   * Deletes a user by ID.
   * @param id - The ID of the user to delete.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  /**
   * Updates the last login timestamp of a user.
   * @param id - The ID of the user.
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() }
    });
  }

  /**
   * Updates the online status of a user.
   * @param id - The ID of the user.
   * @param isOnline - The online status to set.
   */
  async updateOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        isOnline,
        lastSeen: isOnline ? undefined : new Date()
      }
    });
  }

  /**
   * Retrieves statistics related to a user.
   * @param id - The ID of the user.
   * @returns An object containing counts of orders, tickets, and events.
   */
  async getUserStats(id: string) {
    try {
      const [orders, tickets, events] = await Promise.all([
        this.prisma.order.count({ where: { userId: id } }),
        this.prisma.ticket.count({ where: { userId: id } }),
        this.prisma.event.count({
          where: {
            eventAttendees: { // Ensure 'attendees' relation exists in Prisma schema
              some: { userId: id }
            }
          }
        })
      ]);

      return { orders, tickets, events };
    } catch (error) {
      throw new NotFoundException(`Failed to retrieve stats for user ID ${id}`);
    }
  }

  /**
   * Retrieves user activity logs.
   * @param id - The ID of the user.
   * @param take - Number of records to take.
   * @returns An array of user activity logs.
   */
  async getUserActivity(id: string, take = 10) {
    return this.prisma.userActivity.findMany({
      where: { userId: id },
      orderBy: { timestamp: 'desc' },
      take
    });
  }
}
