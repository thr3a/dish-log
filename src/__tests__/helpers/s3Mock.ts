import { mockClient } from 'aws-sdk-client-mock';
import { s3 } from '@/lib/s3';

export const s3Mock = mockClient(s3);
