import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We MUST use the Service Role key to bypass RLS so the server can read all user scores
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const { drawId } = await req.json();

    // 1. Fetch the Draft Draw
    const { data: draw, error: drawError } = await supabaseAdmin
      .from("draws")
      .select("*")
      .eq("id", drawId)
      .single();

    if (drawError || !draw) throw new Error("Draw not found");
    if (draw.status === "published")
      throw new Error("Draw is already published");

    const winningNumbers: number[] = draw.winning_numbers;

    // 2. Fetch all ACTIVE users and their scores
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select(
        `
        id, 
        subscription_status,
        scores ( score_value )
      `,
      )
      .eq("subscription_status", "active");

    if (usersError) throw usersError;

    // 3. Match Logic & Bucketing [cite: 53-55]
    const winners5: string[] = [];
    const winners4: string[] = [];
    const winners3: string[] = [];

    users.forEach((user) => {
      // Get the user's score values
      const userScores = user.scores.map((s: any) => s.score_value);

      // Count how many of their scores match the winning numbers
      let matchCount = 0;
      const tempWinningNums = [...winningNumbers]; // Copy to handle duplicates safely

      userScores.forEach((score: number) => {
        const index = tempWinningNums.indexOf(score);
        if (index > -1) {
          matchCount++;
          tempWinningNums.splice(index, 1); // Remove it so we don't double-count
        }
      });

      if (matchCount === 5) winners5.push(user.id);
      else if (matchCount === 4) winners4.push(user.id);
      else if (matchCount === 3) winners3.push(user.id);
    });

    // 4. Prize Pool Math
    // In a real app, calculate basePool from actual Stripe revenue. We use 5000 for this demo.
    const basePool = 5000;
    const totalPool = basePool + Number(draw.jackpot_carried_forward || 0);

    const pool5 = totalPool * 0.4;
    const pool4 = totalPool * 0.35;
    const pool3 = totalPool * 0.25;

    let newJackpotRollover = 0;
    const winnerInserts: any[] = [];

    // Process 5-Match Winners (or rollover) [cite: 70, 73]
    if (winners5.length > 0) {
      const splitAmount = pool5 / winners5.length;
      winners5.forEach((userId) => {
        winnerInserts.push({
          draw_id: draw.id,
          user_id: userId,
          match_tier: "5-match",
          prize_amount: splitAmount,
        });
      });
    } else {
      newJackpotRollover = pool5; // Rollover the 40% if no one wins
    }

    // Process 4-Match Winners
    if (winners4.length > 0) {
      const splitAmount = pool4 / winners4.length;
      winners4.forEach((userId) => {
        winnerInserts.push({
          draw_id: draw.id,
          user_id: userId,
          match_tier: "4-match",
          prize_amount: splitAmount,
        });
      });
    }

    // Process 3-Match Winners
    if (winners3.length > 0) {
      const splitAmount = pool3 / winners3.length;
      winners3.forEach((userId) => {
        winnerInserts.push({
          draw_id: draw.id,
          user_id: userId,
          match_tier: "3-match",
          prize_amount: splitAmount,
        });
      });
    }

    // 5. Database Execution (Publish Draw & Insert Winners)
    // Update the draw to 'published' and set the new rollover for next month
    await supabaseAdmin
      .from("draws")
      .update({
        status: "published",
        total_prize_pool: totalPool,
        jackpot_carried_forward: newJackpotRollover,
      })
      .eq("id", draw.id);

    // Insert all winning records (they default to admin_verification: 'pending' and payment_status: 'pending') [cite: 85]
    if (winnerInserts.length > 0) {
      await supabaseAdmin.from("winners").insert(winnerInserts);
    }

    return NextResponse.json({
      success: true,
      message: `Published! Found ${winnerInserts.length} winners.`,
    });
  } catch (error: any) {
    console.error("Publish Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
