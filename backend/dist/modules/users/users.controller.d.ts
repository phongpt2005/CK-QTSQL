import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        username: string;
        role: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        username: string;
        role: string | null;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        username: string;
        role: string | null;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        id: number;
        status: number;
        createdAt: Date;
        username: string;
        role: string | null;
    }>;
}
