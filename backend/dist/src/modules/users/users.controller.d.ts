import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: number;
        username: string;
        role: string | null;
        status: number;
        createdAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        username: string;
        role: string | null;
        status: number;
        createdAt: Date;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: number;
        username: string;
        role: string | null;
        status: number;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        id: number;
        username: string;
        role: string | null;
        status: number;
        createdAt: Date;
    }>;
}
