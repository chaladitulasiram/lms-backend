import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetAnalyticsDto } from './dto/analytics.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    /**
     * GET /admin/stats
     * Get real-time platform statistics
     */
    @Get('stats')
    async getStats() {
        return await this.adminService.getStats();
    }

    /**
     * GET /admin/analytics
     * Get historical analytics data
     */
    @Get('analytics')
    async getAnalytics(@Query() query: GetAnalyticsDto) {
        return await this.adminService.getAnalytics(query.startDate, query.endDate);
    }

    /**
     * GET /admin/users
     * Get all users with pagination
     */
    @Get('users')
    async getUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('role') role?: UserRole,
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 20;

        return await this.adminService.getUsers(pageNum, limitNum, role);
    }

    /**
     * GET /admin/snapshot
     * Save current analytics snapshot
     */
    @Get('snapshot')
    async saveSnapshot() {
        await this.adminService.saveAnalyticsSnapshot();
        return { message: 'Analytics snapshot saved successfully' };
    }
}
