// src/cms/cms.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto, UpdatePageDto } from './dto/page.dto';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto'
import { Page, Banner, Faq } from '@prisma/client';

@Injectable()
export class CMSService {
  constructor(private prisma: PrismaService) {}

  // Pages
  async createPage(data: CreatePageDto): Promise<Page> {
    return this.prisma.page.create({
      data: {
        ...data,
        slug: this.generateSlug(data.title),
      },
    });
  }

  async updatePage(id: string, data: UpdatePageDto): Promise<Page> {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    return this.prisma.page.update({
      where: { id },
      data: {
        ...data,
        slug: data.title ? this.generateSlug(data.title) : undefined,
      },
    });
  }

  async deletePage(id: string): Promise<void> {
    await this.prisma.page.delete({ where: { id } });
  }

  async getPageBySlug(slug: string): Promise<Page> {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page) {
      throw new NotFoundException(`Page with slug ${slug} not found`);
    }
    return page;
  }

  async getAllPages(): Promise<Page[]> {
    return this.prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Banners
  async createBanner(data: CreateBannerDto): Promise<Banner> {
    return this.prisma.banner.create({ data });
  }

  async updateBanner(id: string, data: UpdateBannerDto): Promise<Banner> {
    return this.prisma.banner.update({
      where: { id },
      data,
    });
  }

  async deleteBanner(id: string): Promise<void> {
    await this.prisma.banner.delete({ where: { id } });
  }

  async getActiveBanners(): Promise<Banner[]> {
    return this.prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
  }

  async getAllBanners(): Promise<Banner[]> {
    return this.prisma.banner.findMany({
      orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  // Faqs
  async createFaq(data: CreateFaqDto): Promise<Faq> {
    return this.prisma.faq.create({ data });
  }

  async updateFaq(id: string, data: UpdateFaqDto): Promise<Faq> {
    return this.prisma.faq.update({
      where: { id },
      data,
    });
  }

  async deleteFaq(id: string): Promise<void> {
    await this.prisma.faq.delete({ where: { id } }); // Corrected to lowercase 'faq'
  }

  async getFaqsByCategory(category: string): Promise<Faq[]> {
    return this.prisma.faq.findMany({ // Corrected to lowercase 'faq'
      where: { category },
      orderBy: { order: 'asc' },
    });
  }

  async getAllFaqs(): Promise<Faq[]> {
    return this.prisma.faq.findMany({ // Corrected to lowercase 'faq'
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
  }

  // Utility functions
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
