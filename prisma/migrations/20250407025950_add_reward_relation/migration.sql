-- AddForeignKey
ALTER TABLE "reward_history" ADD CONSTRAINT "reward_history_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "reward"("id") ON DELETE SET NULL ON UPDATE CASCADE;
