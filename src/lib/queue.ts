import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        // Fetch queue count
        const { count, error } = await supabase
            .from('queues')
            .select('*', { count: 'exact' });

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ count });
    }

    if (req.method === 'POST') {
        // Add a new queue entry
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const { data, error } = await supabase
            .from('queues')
            .insert([{ name }])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json({ queue: data });
    }

    if (req.method === 'DELETE') {
        // Clear all queues (for admin use)
        const { error } = await supabase.from('queues').delete().neq('id', 0);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'All queues cleared' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}
