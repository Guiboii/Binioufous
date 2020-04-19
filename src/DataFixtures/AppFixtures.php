<?php

namespace App\DataFixtures;

use Faker\Factory;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class AppFixtures extends Fixture
{
    private $encoder;

    public function __construct(UserPasswordEncoderInterface $encoder){
        $this->encoder = $encoder;
    }

    public function load(ObjectManager $manager)
    {

        $faker = Factory::create('FR-fr');
    
        // ajout d'utilisateurs

        for($i = 1; $i <= 10; $i++) {
            $user = new User();

            $hash = $this->encoder->encodePassword($user, 'password');
    
            $user   ->setFirstName($faker->firstname)
                    ->setLastName($faker->lastname)
                    ->setEmail($faker->email)
                    ->setHash($hash);

            $manager-> persist($user);
        }  


        $manager->flush();
    }
}
