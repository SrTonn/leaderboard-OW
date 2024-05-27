import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const Config = {
  NODE_ENV: process.env.NODE_ENV,
};
dotenv.config({ path: `.env.${Config.NODE_ENV}` });

const projectUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const tableName = process.env.SUPABASE_TABLE;
// Create a single supabase client for interacting with your database

const supabase = createClient(projectUrl, supabaseKey);

supabase.auth.signInWithPassword({
  email: process.env.SUPABASE_EMAIL,
  password: process.env.SUPABASE_PASSWORD,
});

const getData = async () => supabase
  .from(tableName)
  .select('battle_tag')
  .is('error', null);

const getAllData = async () => supabase
  .from(tableName)
  .select('battle_tag');

const create = async (obj) => supabase
  .from(tableName)
  .insert(obj)
  .select();

const update = (battleTagList) => battleTagList.forEach(async ({
  error, link, battleTag, platform,
// eslint-disable-next-line no-return-await
}) => await supabase
  .from(tableName)
  .update({ error, link, platform })
  .eq('battle_tag', battleTag)
  .select());

export {
  create, getData, update, getAllData,
};
