BEGIN;

declare user_id;
declare user_email;

set user_id = uuid_generate_v4();
set user_email = user_id || '@test.com';

insert into auth.users (id, email) values (user_id, user_email);

ROLLBACK;