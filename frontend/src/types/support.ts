export interface SupportTicket {
  id: number;
  userId: number;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  username?: string; // from join
}

export interface CreateTicketDto {
  subject: string;
  description: string;
}
